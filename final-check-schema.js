
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function finalCheck() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // We can use the information_schema via a trick or just trust the keys from before + types.ts
    // Let's try to get more details.

    console.log("COLUMNA REAL DE STOCK: stock_count");

    const { data: sample, error } = await supabase
        .from('product_variants')
        .select('id, sku, base_price_cents, stock_count, compare_at_price_cents')
        .limit(2);

    if (error) {
        console.error("Error confirmando datos:", error.message);
    } else {
        console.log("EJEMPLO DE FILAS (2):");
        console.log(JSON.stringify(sample, null, 2));
    }
}

finalCheck();
