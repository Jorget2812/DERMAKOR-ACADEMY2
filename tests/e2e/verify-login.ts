
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testLogin() {
    console.log('Testing login for pro-testing@example.com...')
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'pro-testing@example.com',
        password: 'Password123!'
    })

    if (error) {
        console.error('Login failed:', error.message)
        return
    }

    console.log('Login successful for user:', data.user.id)

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

    console.log('Profile:', profile)
}

testLogin().catch(console.error)
