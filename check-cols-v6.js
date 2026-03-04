
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkOrderItemsCols() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching order_items:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in order_items:', Object.keys(data[0]));
    } else {
        console.log('No data in order_items to inspect columns.');
        // Try to get columns from pg_attribute if possible
        const { data: cols, error: colError } = await supabase.rpc('exec_sql', {
            sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'"
        });
        if (colError) {
            console.log('Could not use exec_sql to get columns.');
        } else {
            console.log('Columns from information_schema:', cols);
        }
    }
}

checkOrderItemsCols();
