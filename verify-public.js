const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function verifyPublicAccess() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, anonKey);

    const slug = 'cica-recovery-gentle-serum';

    console.log(`[VERIFY] Public access for: ${slug}`);

    const { data, error } = await supabase.rpc('get_product_public', { p_slug: slug });

    if (error) {
        console.error('[FAIL] RPC Error:', error.message);
    } else if (!data || (Array.isArray(data) && data.length === 0)) {
        console.error('[FAIL] Product not found via public RPC (404 risk)');
    } else {
        console.log('[SUCCESS] Product found via public RPC.');
        const product = Array.isArray(data) ? data[0] : data;
        console.log('Public Data:', {
            id: product.id,
            name: product.name,
            slug: product.slug,
            has_description: !!product.description,
            has_images: Array.isArray(product.images) && product.images.length > 0
        });
    }
}

verifyPublicAccess();
