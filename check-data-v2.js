
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkData() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("\n--- FASE 1: Muestra de 2 filas recientes (sin order by created_at) ---");
    const { data: rows, error: errRows } = await supabase
        .from('product_variants')
        .select('id, sku, base_price_cents, stock_count, compare_at_price_cents')
        .limit(2);

    if (errRows) {
        console.error("Error fetching rows:", errRows.message);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
}

checkData();
