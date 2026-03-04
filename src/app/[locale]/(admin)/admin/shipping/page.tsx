import { getShippingRates } from '@/domains/admin/shipping-actions'
import { ShippingRatesTable } from '@/domains/admin/components/ShippingRatesTable'

export default async function ShippingAdminPage() {
    const rates = await getShippingRates()

    return (
        <div className="space-y-8">
            <ShippingRatesTable rates={rates} />
        </div>
    )
}
