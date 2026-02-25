const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- Categories ---');
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    if (catError) console.error('Cat Error:', catError);
    else console.table(categories);

    console.log('\n--- Products (first 10) ---');
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, slug, category_id')
        .limit(10);

    if (prodError) console.error('Prod Error:', prodError);
    else console.table(products);
}

diagnose();
