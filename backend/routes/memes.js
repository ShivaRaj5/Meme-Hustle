const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase, genAI, io } = require('../server');

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

// Generate AI caption using Gemini
const generateCaption = async (tags, title) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Generate a funny, cyberpunk-style caption for a meme with title "${title}" and tags: ${tags.join(', ')}. 
        Make it short, witty, and in the style of internet memes. Keep it under 100 characters.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        // Fallback captions
        const fallbackCaptions = [
            "When the code finally works",
            "Debugging be like",
            "That moment when...",
            "Me trying to understand the documentation",
            "YOLO to the moon!",
            "Brrr goes stonks",
            "This is the way",
            "It just works"
        ];
        return fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
    }
};

// Generate AI vibe using Gemini
const generateVibe = async (tags) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Describe the vibe of a meme with tags: ${tags.join(', ')}. 
        Make it short and catchy, like a vibe description. Keep it under 50 characters.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        // Fallback vibes
        const fallbackVibes = [
            "Coding Vibes",
            "Funny Vibes",
            "Relatable Vibes",
            "Tech Vibes",
            "Cyberpunk Vibes",
            "Neon Vibes",
            "Hacker Vibes",
            "Meme Vibes"
        ];
        return fallbackVibes[Math.floor(Math.random() * fallbackVibes.length)];
    }
};

// Get all memes
router.get('/', async (req, res) => {
    try {
        const { data: memes, error } = await supabase
            .from('memes')
            .select(`
                *,
                users!memes_user_id_fkey(name as user_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch memes' });
        }

        res.json({ memes });
    } catch (error) {
        console.error('Get memes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get meme by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: meme, error } = await supabase
            .from('memes')
            .select(`
                *,
                users!memes_user_id_fkey(name as user_name)
            `)
            .eq('id', id)
            .single();

        if (error || !meme) {
            return res.status(404).json({ error: 'Meme not found' });
        }

        res.json({ meme });
    } catch (error) {
        console.error('Get meme error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new meme
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, imageUrl, tags } = req.body;
        const userId = req.user.userId;

        // Get user info
        const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', userId)
            .single();

        // Generate AI caption and vibe
        const caption = await generateCaption(tags, title);
        const vibe = await generateVibe(tags);

        // Create meme
        const { data: newMeme, error } = await supabase
            .from('memes')
            .insert([
                {
                    title,
                    image_url: imageUrl || 'https://picsum.photos/400/300',
                    tags,
                    user_id: userId,
                    caption,
                    vibe,
                    upvotes: 0,
                    downvotes: 0
                }
            ])
            .select(`
                *,
                users!memes_user_id_fkey(name as user_name)
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to create meme' });
        }

        // Emit real-time update
        io.emit('meme_created', { meme: newMeme });

        res.status(201).json({ 
            message: 'Meme created successfully',
            meme: newMeme 
        });
    } catch (error) {
        console.error('Create meme error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update meme
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imageUrl, tags } = req.body;
        const userId = req.user.userId;

        // Check if user owns the meme
        const { data: existingMeme } = await supabase
            .from('memes')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!existingMeme || existingMeme.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this meme' });
        }

        // Generate new AI caption and vibe if tags changed
        let caption = existingMeme.caption;
        let vibe = existingMeme.vibe;
        
        if (tags && tags.length > 0) {
            caption = await generateCaption(tags, title);
            vibe = await generateVibe(tags);
        }

        const { data: updatedMeme, error } = await supabase
            .from('memes')
            .update({
                title,
                image_url: imageUrl,
                tags,
                caption,
                vibe
            })
            .eq('id', id)
            .select(`
                *,
                users!memes_user_id_fkey(name as user_name)
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to update meme' });
        }

        // Emit real-time update
        io.emit('meme_updated', { meme: updatedMeme });

        res.json({ 
            message: 'Meme updated successfully',
            meme: updatedMeme 
        });
    } catch (error) {
        console.error('Update meme error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete meme
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if user owns the meme
        const { data: existingMeme } = await supabase
            .from('memes')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!existingMeme || existingMeme.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this meme' });
        }

        const { error } = await supabase
            .from('memes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to delete meme' });
        }

        // Emit real-time update
        io.emit('meme_deleted', { memeId: id });

        res.json({ message: 'Meme deleted successfully' });
    } catch (error) {
        console.error('Delete meme error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate new caption for meme
router.post('/:id/caption', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Get meme data
        const { data: meme } = await supabase
            .from('memes')
            .select('*')
            .eq('id', id)
            .single();

        if (!meme) {
            return res.status(404).json({ error: 'Meme not found' });
        }

        // Generate new caption
        const newCaption = await generateCaption(meme.tags, meme.title);

        // Update meme with new caption
        const { data: updatedMeme, error } = await supabase
            .from('memes')
            .update({ caption: newCaption })
            .eq('id', id)
            .select(`
                *,
                users!memes_user_id_fkey(name as user_name)
            `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to update caption' });
        }

        // Emit real-time update
        io.emit('meme_caption_updated', { meme: updatedMeme });

        res.json({ 
            message: 'Caption generated successfully',
            meme: updatedMeme 
        });
    } catch (error) {
        console.error('Generate caption error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 