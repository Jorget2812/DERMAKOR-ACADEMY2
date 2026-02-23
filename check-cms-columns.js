
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkColumns() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- Inspecting dashboard_settings columns ---");
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'dashboard_settings' });

    // If RPC doesn't exist, try a simple select with the new columns to see if it fails
    if (error) {
        console.log("RPC get_table_columns failed, attempting direct select check...");
        const { error: selectError } = await supabase
            .from('dashboard_settings')
            .select('hero_bg_color, hero_title_color, hero_body_color')
            .limit(1);

        if (selectError) {
            console.error("Column check failed:", selectError.message);
            if (selectError.message.includes('column "hero_bg_color" does not exist')) {
                console.log("CONFIRMED: Missing color columns.");
            }
        } else {
            console.log("SUCCESS: Color columns exist.");
        }
    } else {
        console.log("Columns found:", data);
    }
}

checkColumns();
