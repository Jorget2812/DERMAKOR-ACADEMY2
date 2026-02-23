import { getAdminPaymentSettings } from "@/domains/commerce/bank-actions"
import { PaymentSettingsForm } from "@/domains/admin/components/PaymentSettingsForm"
import { CreditCard, ChevronLeft } from 'lucide-react'
import { Link } from '@/navigation'

export default async function AdminPaymentSettingsPage() {
    const settings = await getAdminPaymentSettings()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="space-y-4">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-accent transition-colors"
                    >
                        <ChevronLeft size={14} /> Retour aux paramètres
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <CreditCard className="text-accent w-6 h-6" />
                            <h1 className="text-3xl font-serif text-primary">Modes de Paiement</h1>
                        </div>
                        <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">
                            Configurez les options de règlement pour vos clients professionnels.
                        </p>
                    </div>
                </div>
            </header>

            <PaymentSettingsForm initialSettings={settings} />
        </div>
    )
}
