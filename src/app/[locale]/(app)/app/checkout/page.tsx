import { getActivePaymentSettings } from '@/domains/commerce/bank-actions'
import { CheckoutFlowWrapper } from './CheckoutClient'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CheckoutPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const bankDetails = await getActivePaymentSettings()

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto">
                <CheckoutFlowWrapper bankDetails={bankDetails} />
            </div>
        </div>
    )
}
