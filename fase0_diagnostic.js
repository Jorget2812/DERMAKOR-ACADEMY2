
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fase0Diagnostic() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- FASE 0: Columnas de product_variants ---");
    const { data: cols, error: errCols } = await supabase.rpc('get_table_columns_v2', { t_name: 'product_variants' });
    // If RPC doesn't exist, I'll try a raw select from information_schema via a trick or just trust the previous view.
    // Actually, I'll use a script that tries to describe the table.

    console.log("\n--- FASE 0: Conteos ---");
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: varCount } = await supabase.from('product_variants').select('*', { count: 'exact', head: true });
    console.log(`Productos: ${prodCount}, Variantes: ${varCount}`);

    console.log("\n--- FASE 0: Variantes por producto (Bottom 20) ---");
    const { data: summary, error: summaryErr } = await supabase
        .from('products')
        .select(`
            id,
            name,
            product_variants (id)
        `)
        .limit(100);

    if (summaryErr) {
        console.error(summaryErr);
    } else {
        const counts = summary.map(p => ({
            id: p.id.substring(0, 8),
            name: p.name,
            variant_count: p.product_variants.length
        })).sort((a, b) => a.variant_count - b.variant_count);

        console.table(counts.slice(0, 20));
    }
}

fase0Diagnostic();
