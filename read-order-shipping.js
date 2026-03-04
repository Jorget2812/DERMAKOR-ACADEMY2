const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function inspectOrder() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Grab the most recent order with items
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
      id,
      shipping_address,
      billing_address,
      total_final_cents,
      vat_total_cents,
      user_id,
      profiles (level, full_name, email, company_name, phone_pro, phone_personal)
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) { console.error('Error:', error.message); return; }
    if (!orders || orders.length === 0) { console.log('No orders found.'); return; }

    orders.forEach((o, i) => {
        console.log(`\n=== ORDER ${i + 1}: ${o.id} ===`);
        console.log('shipping_address:', JSON.stringify(o.shipping_address, null, 2));
        console.log('billing_address:', JSON.stringify(o.billing_address, null, 2));
        console.log('profile:', JSON.stringify(o.profiles, null, 2));
    });
}

inspectOrder();
