const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_products_with_pricing')
    console.log("RPC Sample Data:", rpcData?.[0])

    const { data: cols, error: colErr } = await supabase.from('products').select('*').limit(1)
    console.log("Products Table Sample:", cols?.[0])
}

check()
