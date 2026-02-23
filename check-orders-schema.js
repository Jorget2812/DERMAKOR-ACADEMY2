const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersColumns() {
    console.log('Checking columns for public.orders table...');

    // We try to fetch one row from orders to see the keys
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log('Error confirmed while selecting *: ', error.message);
        } else {
            console.error('Unexpected error:', error.message);
        }
    }

    // Try a more direct way: query information_schema if possible
    const { data: columns, error: colError } = await supabase
        .rpc('get_products_with_pricing'); // Not helpful for schema check

    // Let's use the error message from a failed select to pinpoint
    console.log('Fetching columns via information_schema query...');
    const { data: schemaCols, error: schemaError } = await supabase
        .from('pg_attribute')
        .select('attname')
        .eq('attrelid', "'public.orders'::regclass")
        .eq('attisdropped', false)
        .gt('attnum', 0);

    if (schemaError) {
        console.log('Direct PG query failed (expected):', schemaError.message);
    } else {
        console.log('Columns found:', schemaCols.map(c => c.attname).join(', '));
    }
}

checkOrdersColumns();
