import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DownloadInvoiceButton } from '@/domains/admin/components/DownloadInvoiceButton'
import { OrderActionsMenu } from '@/components/domains/admin/orders/OrderActionsMenu'
import {
    ShoppingBag,
    FileText,
    Truck,
    MoreHorizontal,
    ArrowUpRight,
    Clock,
    CheckCircle2
} from 'lucide-react'

export default async function AdminOrdersPage() {
    const supabase = await createClient()

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
      *,
      profiles (full_name, company_name)
    `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Gestion des Commandes</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light">Suivez les transactions et générez les factures PDF.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200">Exporter CSV</Button>
                    <Button className="bg-primary text-white">Nouvelle Commande</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                <Card className="border-none shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    <th className="px-6 py-4">Commande #</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total (net)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag size={14} className="text-slate-400" />
                                                <span className="text-xs font-mono font-bold tracking-tighter">ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{order.profiles?.company_name}</span>
                                                <span className="text-[10px] text-slate-400">{order.profiles?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500 font-light">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-CH') : 'N/A'}
                                        </td>

                                        <td className="px-6 py-5 text-sm font-bold">
                                            {(order.total_final_cents / 100).toFixed(2)} CHF
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <DownloadInvoiceButton
                                                    orderId={order.id}
                                                    invoicePath={order.invoice_pdf_path}
                                                />
                                                <OrderActionsMenu
                                                    orderId={order.id}
                                                    invoicePath={order.invoice_pdf_path}
                                                    status={order.status}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orders.length === 0 && (
                        <div className="p-12 text-center">
                            <ShoppingBag className="mx-auto w-12 h-12 text-slate-100 mb-4" />
                            <p className="text-slate-400 text-sm italic">Aucune commande enregistrée pour le moment.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string | null }) {

    if (status === 'PAID') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 w-fit text-[9px] px-2"><CheckCircle2 size={10} /> PAYÉ</Badge>
    if (status === 'PENDING') return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none flex items-center gap-1 w-fit text-[9px] px-2"><Clock size={10} /> EN ATTENTE</Badge>
    return <Badge variant="outline" className="text-slate-400 uppercase text-[9px] px-2 font-light">{status}</Badge>
}
