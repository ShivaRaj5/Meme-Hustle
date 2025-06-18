const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Get trending memes by upvotes
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users(name)
            `)
            .order('upvotes', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch trending memes' });
        }

        // Transform the data to flatten the user name
        const transformedMemes = memes.map(meme => ({
            ...meme,
            user_name: meme.users?.name || 'Anonymous'
        }));

        res.json({ memes: transformedMemes });
    } catch (error) {
        console.error('Get trending memes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get most bid on memes
router.get('/most-bid', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get memes with their bid counts
        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users(name),
                bids(count)
            `)
            .order('bids.count', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch most bid memes' });
        }

        // Transform the data to flatten the user name
        const transformedMemes = memes.map(meme => ({
            ...meme,
            user_name: meme.users?.name || 'Anonymous'
        }));

        res.json({ memes: transformedMemes });
    } catch (error) {
        console.error('Get most bid memes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get highest bid memes
router.get('/highest-bids', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get memes with their highest bid amounts
        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users(name),
                bids!inner(amount)
            `)
            .order('bids.amount', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch highest bid memes' });
        }

        // Transform the data to flatten the user name
        const transformedMemes = memes.map(meme => ({
            ...meme,
            user_name: meme.users?.name || 'Anonymous'
        }));

        res.json({ memes: transformedMemes });
    } catch (error) {
        console.error('Get highest bid memes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent memes
router.get('/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users(name)
            `)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch recent memes' });
        }

        // Transform the data to flatten the user name
        const transformedMemes = memes.map(meme => ({
            ...meme,
            user_name: meme.users?.name || 'Anonymous'
        }));

        res.json({ memes: transformedMemes });
    } catch (error) {
        console.error('Get recent memes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get overall leaderboard (combination of votes and bids)
router.get('/overall', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get memes with vote and bid information
        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users(name),
                bids(count, amount)
            `)
            .order('upvotes', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
        }

        // Transform the data to flatten the user name
        const transformedMemes = memes.map(meme => ({
            ...meme,
            user_name: meme.users?.name || 'Anonymous'
        }));

        // Calculate score for each meme (upvotes + bid count)
        const memesWithScore = transformedMemes.map(meme => ({
            ...meme,
            score: (meme.upvotes || 0) + (meme.bids?.length || 0)
        }));

        // Sort by score
        memesWithScore.sort((a, b) => b.score - a.score);

        res.json({ memes: memesWithScore });
    } catch (error) {
        console.error('Get overall leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user leaderboard (top users by meme count and total upvotes)
router.get('/users', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get users with their meme counts and total upvotes
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                id,
                name,
                email,
                created_at,
                memes(count, upvotes)
            `)
            .order('memes.count', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch user leaderboard' });
        }

        res.json({ users });
    } catch (error) {
        console.error('Get user leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 