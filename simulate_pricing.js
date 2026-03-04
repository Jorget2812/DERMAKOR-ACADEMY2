
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function simulate() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const level = 'STANDARD';
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM

    const query = `
    WITH active_rules AS (
      SELECT * FROM pricing_pro_rules 
      WHERE level = '${level}' AND active = true AND year_month = '${month}'
    ),
    product_factors AS (
      SELECT 
        p.id as product_id,
        p.name,
        v.id as variant_id,
        v.base_price_cents,
        p.category_id,
        -- Product Rule
        (SELECT resale_factor FROM active_rules WHERE scope = 'PRODUCT' AND product_id = p.id LIMIT 1) as product_factor,
        -- Category Rule
        (SELECT resale_factor FROM active_rules WHERE scope = 'CATEGORY' AND category_id = p.category_id LIMIT 1) as category_factor,
        -- Global Rule
        (SELECT resale_factor FROM active_rules WHERE scope = 'GLOBAL' LIMIT 1) as global_factor
      FROM products p
      JOIN product_variants v ON v.product_id = p.id
      WHERE p.active = true AND v.active = true
    )
    SELECT 
      name,
      base_price_cents as retail_price,
      COALESCE(product_factor, category_factor, global_factor, 1.0) as applied_factor,
      round(base_price_cents / COALESCE(product_factor, category_factor, global_factor, 1.0))::integer as net_price_pro
    FROM product_factors
    LIMIT 10;
  `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

    if (error) {
        // If exec_sql is missing, let's try to find another way or just output the query for the user to run if they have access.
        // But I can try to use a simple SELECT if I can.
        console.error('Simulation Error (exec_sql might be missing):', error.message);
        console.log('Query for manual verification:\n', query);
    } else {
        console.log(`Simulation Results for level: ${level}`);
        console.table(data);
    }
}

simulate();
