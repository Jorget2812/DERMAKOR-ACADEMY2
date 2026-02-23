const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
    const slug = 'cica-recovery-gentle-serum';
    console.log(`Checking product with slug: ${slug}`);

    // Check in products table
    const { data: product, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (pError) {
        console.error('Error fetching product:', pError.message);
    } else {
        console.log('Product found:', JSON.stringify(product, null, 2));

        // Check variants
        const { data: variants, error: vError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id);

        if (vError) {
            console.error('Error fetching variants:', vError.message);
        } else {
            console.log('Variants found:', variants.length);
            variants.forEach(v => console.log(`- Variant: ${v.sku}, Price: ${v.base_price_cents}`));
        }
    }

    // Check RPC results
    console.log('\nChecking RPC get_products_with_pricing results...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_products_with_pricing');

    if (rpcError) {
        console.error('RPC Error:', rpcError.message);
    } else {
        const found = rpcData.find(p => p.slug === slug);
        if (found) {
            console.log('Product found via RPC!');
        } else {
            console.log('Product NOT found via RPC. This is why it returns 404.');
            console.log('First 3 items in RPC:', JSON.stringify(rpcData.slice(0, 3), null, 2));
        }
    }
}

checkProduct();
