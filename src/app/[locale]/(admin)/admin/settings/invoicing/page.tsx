import { getAdminInvoiceSettings } from '@/domains/commerce/invoice-actions'
import { InvoicingSettingsForm } from '@/domains/commerce/components/InvoicingSettingsForm'
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AdminInvoicingSettingsPage() {
    const settings = await getAdminInvoiceSettings()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100 transition-all">
                            <ArrowLeft size={18} className="text-slate-400" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FileText size={16} className="text-accent" />
                            <h1 className="text-2xl font-serif text-primary">Paramètres de Facturation</h1>
                        </div>
                        <p className="text-muted-foreground text-sm font-light">Personnalisez l'apparence et les informations de vos factures PDF.</p>
                    </div>
                </div>
            </header>

            <InvoicingSettingsForm initialSettings={settings} />
        </div>
    )
}
