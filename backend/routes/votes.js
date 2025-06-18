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

// Get votes for a meme
router.get('/meme/:memeId', async (req, res) => {
    try {
        const { memeId } = req.params;

        const { data: meme, error } = await supabase
            .from('memes')
            .select('upvotes, downvotes')
            .eq('id', memeId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch votes' });
        }

        res.json({
            upvotes: meme.upvotes || 0,
            downvotes: meme.downvotes || 0
        });
    } catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vote on a meme
router.post('/meme/:memeId', authenticateToken, async (req, res) => {
    try {
        const { memeId } = req.params;
        const { type } = req.body; // 'up' or 'down'
        const userId = req.user.userId;

        if (!['up', 'down'].includes(type)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }

        // Check if user has already voted on this meme
        const { data: existingVote, error: voteError } = await supabase
            .from('votes')
            .select('*')
            .eq('meme_id', memeId)
            .eq('user_id', userId)
            .single();

        // Get current meme data
        const { data: meme, error: memeError } = await supabase
            .from('memes')
            .select('upvotes, downvotes')
            .eq('id', memeId)
            .single();

        if (memeError) {
            console.error('Supabase error:', memeError);
            return res.status(500).json({ error: 'Failed to fetch meme' });
        }

        let newUpvotes = meme.upvotes || 0;
        let newDownvotes = meme.downvotes || 0;

        if (existingVote) {
            // User has already voted
            if (existingVote.vote_type === type) {
                // Remove vote (toggle off)
                const { error: deleteError } = await supabase
                    .from('votes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) {
                    console.error('Supabase error:', deleteError);
                    return res.status(500).json({ error: 'Failed to remove vote' });
                }

                // Update meme vote counts
                if (type === 'up') {
                    newUpvotes = Math.max(0, newUpvotes - 1);
                } else {
                    newDownvotes = Math.max(0, newDownvotes - 1);
                }
            } else {
                // Change vote type
                const { error: updateError } = await supabase
                    .from('votes')
                    .update({ vote_type: type })
                    .eq('id', existingVote.id);

                if (updateError) {
                    console.error('Supabase error:', updateError);
                    return res.status(500).json({ error: 'Failed to update vote' });
                }

                // Update meme vote counts
                if (existingVote.vote_type === 'up') {
                    newUpvotes = Math.max(0, newUpvotes - 1);
                    newDownvotes += 1;
                } else {
                    newDownvotes = Math.max(0, newDownvotes - 1);
                    newUpvotes += 1;
                }
            }
        } else {
            // New vote
            const { error: insertError } = await supabase
                .from('votes')
                .insert([
                    {
                        meme_id: memeId,
                        user_id: userId,
                        vote_type: type,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error('Supabase error:', insertError);
                return res.status(500).json({ error: 'Failed to create vote' });
            }

            // Update meme vote counts
            if (type === 'up') {
                newUpvotes += 1;
            } else {
                newDownvotes += 1;
            }
        }

        // Update meme with new vote counts
        const { data: updatedMeme, error: updateMemeError } = await supabase
            .from('memes')
            .update({
                upvotes: newUpvotes,
                downvotes: newDownvotes
            })
            .eq('id', memeId)
            .select(`
                *,
                users(name)
            `)
            .single();

        if (updateMemeError) {
            console.error('Supabase error:', updateMemeError);
            return res.status(500).json({ error: 'Failed to update meme votes' });
        }

        // Transform the data to flatten the user name
        const transformedMeme = {
            ...updatedMeme,
            user_name: updatedMeme.users?.name || 'Anonymous'
        };

        // Emit real-time updates
        io.emit('vote_updated', {
            memeId,
            meme: transformedMeme,
            voteType: type,
            action: existingVote ? (existingVote.vote_type === type ? 'removed' : 'changed') : 'added'
        });

        res.json({
            message: 'Vote processed successfully',
            meme: transformedMeme,
            voteType: type,
            action: existingVote ? (existingVote.vote_type === type ? 'removed' : 'changed') : 'added'
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's vote on a meme
router.get('/meme/:memeId/user', authenticateToken, async (req, res) => {
    try {
        const { memeId } = req.params;
        const userId = req.user.userId;

        const { data: vote, error } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('meme_id', memeId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch user vote' });
        }

        res.json({ voteType: vote ? vote.vote_type : null });
    } catch (error) {
        console.error('Get user vote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's voting history
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data: votes, error } = await supabase
            .from('votes')
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
            return res.status(500).json({ error: 'Failed to fetch user votes' });
        }

        // Transform the data to flatten the meme data
        const transformedVotes = votes.map(vote => ({
            ...vote,
            meme: vote.memes
        }));

        res.json({ votes: transformedVotes });
    } catch (error) {
        console.error('Get user votes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 