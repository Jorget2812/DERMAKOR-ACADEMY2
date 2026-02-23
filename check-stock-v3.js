
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkStockConstraints() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- PASO 1: Constraint/Default de stock_count ---");
    // Since I can't query information_schema directly with supabase-js easily without a helper RPC,
    // I'll try to fetch a sample and check if I can insert a null to provoke the error and confirm column exists.

    const { data: cols, error: errCols } = await supabase.from('product_variants').select('stock_count').limit(1);
    console.log("Column 'stock_count' exists:", !errCols);

    console.log("\n--- PASO 1: Filas con stock_count NULL ---");
    const { data: nulls, error: errNulls } = await supabase
        .from('product_variants')
        .select('id, sku, stock_count')
        .is('stock_count', null);

    if (errNulls) {
        console.error("Error al buscar nulos:", errNulls.message);
    } else {
        console.log(`Encontradas ${nulls.length} filas con stock_count NULL.`);
        if (nulls.length > 0) {
            console.log("Ejemplo:", nulls.slice(0, 5));
        }
    }
}

checkStockConstraints();
