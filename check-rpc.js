
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRPC() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- Checking is_admin function definition ---");
    const { data, error } = await supabase.rpc('get_function_definition', { function_name: 'is_admin' });

    if (error) {
        console.log("Could not get function definition via RPC, trying direct probe...");
        // Try calling it with and without params
        const { data: d1, error: e1 } = await supabase.rpc('is_admin');
        const { data: d2, error: e2 } = await supabase.rpc('is_admin', { p_uid: '00000000-0000-0000-0000-000000000000' });

        console.log("Call without params:", { data: d1, error: e1?.message });
        console.log("Call with p_uid:", { data: d2, error: e2?.message });
    } else {
        console.log("Function Definition:", data);
    }
}

checkRPC();
