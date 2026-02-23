
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function findViolators() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
        .from('product_variants')
        .select('id, sku')
        .or('sku.eq., sku.is.null');

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`Encontradas ${data.length} filas con SKU vacío o NULL.`);
        console.log("Muestra:", data.slice(0, 5));
    }
}

findViolators();
