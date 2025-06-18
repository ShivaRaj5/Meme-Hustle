const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMemeCreation() {
    try {
        console.log("Testing meme creation...");

        // First, get a user to create the meme
        const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .limit(1);

        if (!users || users.length === 0) {
            console.log("No users found. Creating a test user first...");
            const { data: newUser } = await supabase
                .from('users')
                .insert([
                    {
                        name: "Test User",
                        email: "testmeme@example.com",
                        password: "password123",
                        credits: 500
                    }
                ])
                .select('id, name')
                .single();
            
            if (newUser) {
                console.log("Created test user:", newUser);
            }
        }

        // Get user for meme creation
        const { data: user } = await supabase
            .from('users')
            .select('id, name')
            .limit(1)
            .single();

        if (!user) {
            console.error("No user available for meme creation");
            return;
        }

        console.log("Creating meme for user:", user.name);

        // Create a test meme
        const { data: meme, error } = await supabase
            .from('memes')
            .insert([
                {
                    title: "Test Meme",
                    image_url: "https://picsum.photos/400/300",
                    tags: ["test", "funny", "meme"],
                    user_id: user.id,
                    caption: "This is a test meme caption",
                    vibe: "Test Vibes",
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
            console.error("Meme creation error:", error);
        } else {
            console.log("Meme created successfully:", meme);
            
            // Test creating a bid
            console.log("Testing bid creation...");
            const { data: bid, error: bidError } = await supabase
                .from('bids')
                .insert([
                    {
                        meme_id: meme.id,
                        user_id: user.id,
                        amount: 100
                    }
                ])
                .select(`
                    *,
                    users!bids_user_id_fkey(name as user_name)
                `)
                .single();

            if (bidError) {
                console.error("Bid creation error:", bidError);
            } else {
                console.log("Bid created successfully:", bid);
            }

            // Test creating a vote
            console.log("Testing vote creation...");
            const { data: vote, error: voteError } = await supabase
                .from('votes')
                .insert([
                    {
                        meme_id: meme.id,
                        user_id: user.id,
                        vote_type: "up"
                    }
                ])
                .select()
                .single();

            if (voteError) {
                console.error("Vote creation error:", voteError);
            } else {
                console.log("Vote created successfully:", vote);
            }
        }

        // Test reading all tables
        console.log("\nTesting table reads...");
        
        const { data: allMemes } = await supabase.from('memes').select('*');
        console.log(`Found ${allMemes?.length || 0} memes`);
        
        const { data: allBids } = await supabase.from('bids').select('*');
        console.log(`Found ${allBids?.length || 0} bids`);
        
        const { data: allVotes } = await supabase.from('votes').select('*');
        console.log(`Found ${allVotes?.length || 0} votes`);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testMemeCreation(); 