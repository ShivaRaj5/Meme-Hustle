const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { io } = require('../server');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Get all bids for a meme
router.get('/meme/:memeId', async (req, res) => {
    try {
        const { memeId } = req.params;

        const { data: bids, error } = await supabase
            .from('bids')
            .select(`
                *,
                users(name)
            `)
            .eq('meme_id', memeId)
            .order('amount', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch bids' });
        }

        // Transform the data to flatten the user name
        const transformedBids = bids.map(bid => ({
            ...bid,
            user_name: bid.users?.name || 'Anonymous'
        }));

        res.json({ bids: transformedBids });
    } catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get highest bid for a meme
router.get('/meme/:memeId/highest', async (req, res) => {
    try {
        const { memeId } = req.params;

        const { data: highestBid, error } = await supabase
            .from('bids')
            .select(`
                *,
                users(name)
            `)
            .eq('meme_id', memeId)
            .order('amount', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch highest bid' });
        }

        // Transform the data to flatten the user name
        const transformedBid = highestBid ? {
            ...highestBid,
            user_name: highestBid.users?.name || 'Anonymous'
        } : null;

        res.json({ highestBid: transformedBid });
    } catch (error) {
        console.error('Get highest bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Place a bid
router.post('/meme/:memeId', authenticateToken, async (req, res) => {
    try {
        const { memeId } = req.params;
        const { amount } = req.body;
        const userId = req.user.userId;

        // Validate bid amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid bid amount' });
        }

        // Get user's current credits
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('credits, name')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has enough credits
        if (user.credits < amount) {
            return res.status(400).json({ error: 'Insufficient credits' });
        }

        // Get current highest bid
        const { data: currentHighestBid } = await supabase
            .from('bids')
            .select('amount')
            .eq('meme_id', memeId)
            .order('amount', { ascending: false })
            .limit(1)
            .single();

        // Check if new bid is higher than current highest
        if (currentHighestBid && amount <= currentHighestBid.amount) {
            return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
        }

        // Check if user already has a bid on this meme
        const { data: existingBid } = await supabase
            .from('bids')
            .select('*')
            .eq('meme_id', memeId)
            .eq('user_id', userId)
            .single();

        let newBid;
        if (existingBid) {
            // Update existing bid
            const { data: updatedBid, error: updateError } = await supabase
                .from('bids')
                .update({
                    amount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingBid.id)
                .select(`
                    *,
                    users(name)
                `)
                .single();

            if (updateError) {
                console.error('Supabase error:', updateError);
                return res.status(500).json({ error: 'Failed to update bid' });
            }

            // Transform the data to flatten the user name
            newBid = {
                ...updatedBid,
                user_name: updatedBid.users?.name || 'Anonymous'
            };
        } else {
            // Create new bid
            const { data: createdBid, error: createError } = await supabase
                .from('bids')
                .insert([
                    {
                        meme_id: memeId,
                        user_id: userId,
                        amount,
                        created_at: new Date().toISOString()
                    }
                ])
                .select(`
                    *,
                    users(name)
                `)
                .single();

            if (createError) {
                console.error('Supabase error:', createError);
                return res.status(500).json({ error: 'Failed to create bid' });
            }

            // Transform the data to flatten the user name
            newBid = {
                ...createdBid,
                user_name: createdBid.users?.name || 'Anonymous'
            };
        }

        // Update user's credits
        const newCredits = user.credits - amount;
        const { error: creditError } = await supabase
            .from('users')
            .update({ credits: newCredits })
            .eq('id', userId);

        if (creditError) {
            console.error('Credit update error:', creditError);
            return res.status(500).json({ error: 'Failed to update credits' });
        }

        // Emit real-time updates
        io.emit('bid_placed', {
            memeId,
            bid: newBid,
            userCredits: newCredits
        });

        io.emit('credits_updated', {
            userId,
            credits: newCredits
        });

        res.json({
            message: 'Bid placed successfully',
            bid: newBid,
            remainingCredits: newCredits
        });
    } catch (error) {
        console.error('Place bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's bids
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data: bids, error } = await supabase
            .from('bids')
            .select(`
                *,
                memes(
                    id,
                    title,
                    image_url,
                    caption,
                    vibe
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch user bids' });
        }

        // Transform the data to flatten the meme data
        const transformedBids = bids.map(bid => ({
            ...bid,
            meme: bid.memes
        }));

        res.json({ bids: transformedBids });
    } catch (error) {
        console.error('Get user bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel/delete a bid
router.delete('/:bidId', authenticateToken, async (req, res) => {
    try {
        const { bidId } = req.params;
        const userId = req.user.userId;

        // Get bid details
        const { data: bid, error: bidError } = await supabase
            .from('bids')
            .select('*')
            .eq('id', bidId)
            .eq('user_id', userId)
            .single();

        if (bidError || !bid) {
            return res.status(404).json({ error: 'Bid not found or not authorized' });
        }

        // Delete the bid
        const { error: deleteError } = await supabase
            .from('bids')
            .delete()
            .eq('id', bidId);

        if (deleteError) {
            console.error('Supabase error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete bid' });
        }

        // Refund credits to user
        const { data: user } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single();

        const newCredits = user.credits + bid.amount;
        const { error: creditError } = await supabase
            .from('users')
            .update({ credits: newCredits })
            .eq('id', userId);

        if (creditError) {
            console.error('Credit refund error:', creditError);
            return res.status(500).json({ error: 'Failed to refund credits' });
        }

        // Emit real-time updates
        io.emit('bid_cancelled', {
            memeId: bid.meme_id,
            bidId,
            userCredits: newCredits
        });

        io.emit('credits_updated', {
            userId,
            credits: newCredits
        });

        res.json({
            message: 'Bid cancelled successfully',
            refundedCredits: bid.amount,
            remainingCredits: newCredits
        });
    } catch (error) {
        console.error('Cancel bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 