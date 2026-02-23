
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setup() {
    console.log('Seeding test data...')

    // 1. Ensure a test category exists
    const { data: cat } = await supabase.from('categories').upsert({
        name: 'Test Category',
        slug: 'test-category'
    }).select().single()

    // 2. Ensure a test product exists
    const { data: prod } = await supabase.from('products').upsert({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A product for E2E testing',
        category_id: cat?.id,
        active: true
    }).select().single()

    // 3. Ensure a variant exists
    await supabase.from('product_variants').upsert({
        product_id: prod?.id,
        sku: 'TEST-SKU-1',
        name: 'Standard Variant',
        base_price_cents: 10000, // 100 CHF
        stock_count: 50,
        active: true
    })

    // 4. Ensure an out-of-stock variant exists
    await supabase.from('product_variants').upsert({
        product_id: prod?.id,
        sku: 'TEST-SKU-EMPTY',
        name: 'Empty Variant',
        base_price_cents: 5000,
        stock_count: 0,
        active: true
    })

    // 5. Create/Update Test professional user
    // We need a real email for login, but for E2E we can use a dummy one if we can bypass verification
    const testEmail = 'pro-testing@example.com'
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'Test Professional' }
    })

    let userId = authUser?.user?.id
    if (authError && authError.message.includes('already registered')) {
        const { data: existing } = await supabase.from('profiles').select('id').eq('email', testEmail).single()
        userId = existing?.id
    }

    if (userId) {
        await supabase.from('profiles').upsert({
            id: userId,
            email: testEmail,
            full_name: 'Test Professional',
            company_name: 'Testing Corp',
            verification_status: 'APPROVED',
            status: 'ACTIVE',
            level: 'STANDARD'
        })
    }

    console.log('Seeding complete.')
}

setup().catch(console.error)
