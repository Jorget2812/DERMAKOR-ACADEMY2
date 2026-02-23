
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
    try {
        console.log("--- START INSPECTION ---");
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.error("Missing env vars: URL or KEY");
            return;
        }

        const supabase = createClient(url, key);

        console.log("Checking payment_settings table...");
        const { data, error } = await supabase.from('payment_settings').select('*').limit(1);

        if (error) {
            console.error("Error accessing payment_settings:", JSON.stringify(error, null, 2));
        } else {
            console.log("Successfully accessed payment_settings table:", data);
        }

        console.log("Checking bank_settings table...");
        const { data: bData, error: bError } = await supabase.from('bank_settings').select('*').limit(1);

        if (bError) {
            console.error("Error accessing bank_settings:", JSON.stringify(bError, null, 2));
        } else {
            console.log("Successfully accessed bank_settings table:", bData);
        }

    } catch (e) {
        console.error("Fatal error in script:", e);
    }
}

inspect();
