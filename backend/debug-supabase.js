const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log("Testing Supabase connection...");
        
        // Test basic connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error("Connection test failed:", error);
        } else {
            console.log("Connection successful!");
        }
        
        // Test RLS status
        const { data: rlsData, error: rlsError } = await supabase
            .rpc('get_table_rls_status', { table_name: 'users' });
            
        if (rlsError) {
            console.log("RLS status check failed (this is normal):", rlsError.message);
        } else {
            console.log("RLS status:", rlsData);
        }
        
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testConnection(); 