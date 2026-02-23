const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// This script simulates the backend logic to verify 404 fix
async function verifyFix() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const slug = 'cica-recovery-gentle-serum';

    console.log('--- Verification of 404 Fix ---');

    // Simulate direct fetch logic
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            id, name, slug, description, images, category_id,
            product_variants!inner (
                id, sku, base_price_cents, stock_count, active
            )
        `)
        .eq('slug', slug)
        .eq('active', true)
        .eq('product_variants.active', true)
        .maybeSingle();

    if (error || !product) {
        console.error('FAILED: Product still not found directly!');
    } else {
        console.log('SUCCESS: Product found directly by slug.');
        console.log('Product ID:', product.id);
        console.log('Active Variants:', product.product_variants.length);

        // Check if price calculation would work
        const variant = product.product_variants[0];
        console.log('Base Price:', variant.base_price_cents);
    }
}

verifyFix();
