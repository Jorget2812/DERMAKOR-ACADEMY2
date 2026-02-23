
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRLS() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- Checking RLS Policies for dashboard_settings ---");
    const { data, error } = await supabase.rpc('get_policies', { tablename: 'dashboard_settings' });

    if (error) {
        console.log("RPC get_policies failed, attempting manual query...");
        const { data: d2, error: e2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'dashboard_settings');
        if (e2) console.error("Policy check failed:", e2.message);
        else console.log("Policies found:", d2);
    } else {
        console.log("Policies found:", data);
    }
}

checkRLS();
