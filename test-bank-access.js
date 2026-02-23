
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- TABLE SEARCH ---");
    const { data: tables, error: errTables } = await supabase.rpc('get_table_schema', { table_name: 'payment_settings' });

    // If get_table_schema is not available or doesn't find it, try a select
    const { data: checkTable, error: errCheckTable } = await supabase.from('payment_settings').select('id').limit(1);
    if (!errCheckTable) {
        console.log("Found payment_settings table!");
    } else {
        console.log("payment_settings table probably does not exist:", errCheckTable.message);
    }

    // Search columns in orders
    const { data: ordersSample, error: errOrders } = await supabase.from('orders').select('*').limit(1);
    if (!errOrders && ordersSample.length > 0) {
        console.log("Columns in orders:", Object.keys(ordersSample[0]));
    }
}

inspect();
