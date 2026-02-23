const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderRPC() {
    console.log('Checking for create_order_secure RPC...');

    // Check if the function exists in pg_proc
    const { data: functions, error } = await supabase
        .from('pg_proc')
        .select(`
            proname,
            proargnames,
            prosrc
        `)
        .ilike('proname', 'create_order_secure');

    if (error) {
        console.log('Could not query pg_proc directly (RLS likely):', error.message);

        // Alternative: Try to call it with dummy data and catch the error
        console.log('Attempting trial call to create_order_secure...');
        const { error: rpcError } = await supabase.rpc('create_order_secure', {
            p_shipping_address: {},
            p_billing_address: {},
            p_items: []
        });

        if (rpcError) {
            console.log('RPC Call Result:', rpcError.message);
            if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
                console.error('ERROR: create_order_secure DOES NOT EXIST in the database.');
            } else {
                console.log('RPC exists but returned error (expected for dummy data):', rpcError.message);
            }
        } else {
            console.log('RPC exists and executed successfully with empty data.');
        }
    } else {
        console.log('Function found in pg_proc:', functions.length > 0 ? 'Yes' : 'No');
        if (functions.length > 0) {
            console.log('Arguments:', functions[0].proargnames);
        }
    }
}

checkOrderRPC();
