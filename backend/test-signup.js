const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    try {
        const testUser = {
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        };

        console.log("Testing signup with:", testUser);

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', testUser.email)
            .single();

        if (existingUser) {
            console.log("User already exists, deleting for test...");
            await supabase
                .from('users')
                .delete()
                .eq('email', testUser.email);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        console.log("Attempting to create user...");

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name: testUser.name,
                    email: testUser.email,
                    password: hashedPassword,
                    credits: 500
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            // Try to get more details about the table
            const { data: tableInfo, error: tableError } = await supabase
                .from('users')
                .select('*')
                .limit(1);
                
            if (tableError) {
                console.error("Table access error:", tableError);
            } else {
                console.log("Table is accessible for reading");
            }
        } else {
            console.log("User created successfully:", newUser);
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testSignup(); 