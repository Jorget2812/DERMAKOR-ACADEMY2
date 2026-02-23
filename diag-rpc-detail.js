const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllFunctions() {
    console.log('Listing all functions in public schema...');

    // We can use a query to pg_proc if we use service role
    const { data, error } = await supabase.rpc('get_products_with_pricing'); // Just to test connection
    if (error) {
        console.error('Connection/RPC Test Error:', error.message);
    }

    // Try to get function list via SQL
    const { data: functions, error: sqlError } = await supabase
        .from('pg_proc')
        .select('proname')
        .limit(10); // Probably won't work due to schema cache

    // Let's try to call the create_order_secure again but with VERY EXPLICIT logging
    const { data: orderId, error: rpcError } = await supabase.rpc('create_order_secure', {
        p_shipping_address: { country: 'CH', city: 'Test' },
        p_billing_address: { country: 'CH', city: 'Test' },
        p_items: []
    });

    if (rpcError) {
        console.log('--- RPC ERROR DETAIL ---');
        console.log('Message:', rpcError.message);
        console.log('Code:', rpcError.code);
        console.log('Details:', rpcError.details);
        console.log('Hint:', rpcError.hint);
        console.log('------------------------');
    } else {
        console.log('RPC exists and returned data:', orderId);
    }
}

listAllFunctions();
