const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRPC() {
    const { data, error } = await supabase.rpc('get_products_with_pricing');
    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Data count:', data.length);
        if (data.length > 0) {
            console.log('Sample item keys:', Object.keys(data[0]));
        } else {
            console.log('RPC returned empty. Checking if user is approved...');
        }
    }

    // Check RPC definition from information_schema
    const { data: def, error: defError } = await supabase.from('pg_proc').select('prosrc').eq('proname', 'get_products_with_pricing');
    // Note: pg_proc might not be accessible via PostgREST easily without a custom SQL.

    // Better: Run an ad-hoc query to check for column existence in the return type
    const { data: cols, error: colError } = await supabase.from('pg_attribute')
        .select('attname')
        .eq('attrelid', "(SELECT typrelid FROM pg_type WHERE typname = 'get_products_with_pricing_result')") // This is tricky

    // Let's just try to call it and see if it has 'slug'
    console.log('Keys of first element:', data.length > 0 ? Object.keys(data[0]) : 'N/A');
}

inspectRPC();
