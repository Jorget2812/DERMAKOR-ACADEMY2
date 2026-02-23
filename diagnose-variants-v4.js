
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnoseVariants() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- PASO 1: Conteos Totales ---");
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: varCount } = await supabase.from('product_variants').select('*', { count: 'exact', head: true });
    console.log(`Productos: ${prodCount}, Variantes: ${varCount}`);

    console.log("\n--- PASO 1: Variantes Huérfanas ---");
    const { count: orphanCount } = await supabase.from('product_variants').select('*', { count: 'exact', head: true }).is('product_id', null);
    console.log(`Variantes sin product_id: ${orphanCount}`);

    console.log("\n--- PASO 1: Ejemplo de Join (Products -> Variants) ---");
    const { data: joinSample, error: joinError } = await supabase
        .from('products')
        .select(`
            id,
            name,
            product_variants (id, sku, base_price_cents, stock_count)
        `)
        .limit(5);

    if (joinError) {
        console.error("Error en Join:", joinError.message);
    } else {
        joinSample.forEach(p => {
            console.log(`Producto: ${p.name} (ID: ${p.id.substring(0, 8)}...) -> Variantes: ${p.product_variants.length}`);
            if (p.product_variants.length > 0) {
                console.log(`  Ejemplo Variante: SKU=${p.product_variants[0].sku}, Precio=${p.product_variants[0].base_price_cents}, Stock=${p.product_variants[0].stock_count}`);
            }
        });
    }
}

diagnoseVariants();
