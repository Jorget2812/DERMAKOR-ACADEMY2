const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function deepDiag() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const slug = 'cica-recovery-gentle-serum';

    console.log(`Deep Diagnostic for: ${slug}`);

    // 1. Check raw product
    const { data: rawP, error: e1 } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (e1) console.log('E1:', e1.message);
    else console.log('Product Active Status:', rawP.active);

    // 2. Check variants raw
    const { data: vars, error: e2 } = await supabase.from('product_variants').select('*').eq('product_id', rawP?.id);
    if (e2) console.log('E2:', e2.message);
    else {
        vars.forEach(v => console.log(`Variant SKU: ${v.sku}, Active: ${v.active}, Stock: ${v.stock_count}`));
    }

    // 3. Test exact query used in code
    const { data: product, error: e3 } = await supabase
        .from('products')
        .select(`
            id, name, slug, description, images, category_id,
            product_variants!inner (
                id, sku, base_price_cents, stock_count, active
            )
        `)
        .eq('slug', slug)
        .eq('active', true);
    // Note: I separated the variant filter to see if it makes a difference

    if (e3) console.log('E3:', e3.message);
    else console.log('Query result count:', product?.length);

    if (product?.length > 0) {
        // filter variant manually to see
        const activeVariants = product[0].product_variants.filter(v => v.active === true);
        console.log('Active variants in result:', activeVariants.length);
    }
}

deepDiag();
