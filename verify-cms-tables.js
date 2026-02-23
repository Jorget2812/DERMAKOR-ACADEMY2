
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyCMSTables() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- Checking dashboard_settings ---");
    const { data: dsData, error: dsError } = await supabase
        .from('dashboard_settings')
        .select('id')
        .limit(1);

    if (dsError) {
        console.error("Error dashboard_settings:", dsError.message);
    } else {
        console.log("dashboard_settings exists.");
    }

    console.log("\n--- Checking product_badges ---");
    const { data: pbData, error: pbError } = await supabase
        .from('product_badges')
        .select('id')
        .limit(1);

    if (pbError) {
        console.error("Error product_badges:", pbError.message);
    } else {
        console.log("product_badges exists.");
    }
}

verifyCMSTables();
