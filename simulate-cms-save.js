
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function simulateSave() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const testSettings = {
        level: 'STANDARD',
        locale: 'fr',
        enabled: true,
        hero_title: 'Test Title ' + Date.now(),
        hero_bg_color: '#FF0000',
        hero_title_color: '#FFFFFF',
        hero_body_color: '#CCCCCC'
    };

    console.log("--- Simulating upsert into dashboard_settings ---");
    const { data, error } = await supabase
        .from('dashboard_settings')
        .upsert(testSettings, { onConflict: 'level,locale' })
        .select()
        .single();

    if (error) {
        console.error("UPSERT ERROR:", error.message);
        console.error("DETAILS:", error.details);
        console.error("HINT:", error.hint);
    } else {
        console.log("UPSERT SUCCESS:", data.id);
    }
}

simulateSave();
