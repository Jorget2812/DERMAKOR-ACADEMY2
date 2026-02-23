
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log("--- FASE 1: Columnas de product_variants ---");
    const { data: cols, error: errCols } = await supabase.rpc('get_table_schema', { table_name: 'product_variants' });

    // In case RPC doesn't exist, we use a raw query if possible, but since I can't run raw SQL easily without RPC, 
    // I will try to fetch one row and check keys.
    const { data: sample, error: errSample } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);

    if (errSample) {
        console.error("Error fetching sample:", errSample.message);
    } else if (sample && sample.length > 0) {
        console.log("Real Columns found in data:", Object.keys(sample[0]));
    } else {
        console.log("No data found in product_variants yet.");
    }

    console.log("\n--- FASE 1: Muestra de 2 filas recientes ---");
    const { data: rows, error: errRows } = await supabase
        .from('product_variants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

    if (errRows) {
        console.error("Error fetching rows:", errRows.message);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
}

checkSchema();
