import { createClient } from '@/lib/supabase/server'
import { getAdminOrder } from '@/domains/admin/order-actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderActionsMenu } from '@/components/domains/admin/orders/OrderActionsMenu'
import {
    ShoppingBag,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Package
} from 'lucide-react'
import { Link } from '@/navigation'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params

    let order;
    try {
        order = await getAdminOrder(id)
    } catch (e) {
        return notFound()
    }

    if (!order) return notFound()

    const profile = order.profiles as any
    const shipping = order.shipping_address as any
    const billing = order.billing_address as any || shipping

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-serif text-primary">Commande</h1>
                            <span className="text-lg font-mono text-slate-300">ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm font-light">
                            Passée le {new Date(order.created_at || '').toLocaleString('fr-CH')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <OrderActionsMenu
                        orderId={order.id}
                        invoicePath={order.invoice_pdf_path}
                        status={order.status}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Table */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-serif">Articles commandés</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30 border-b border-slate-50">
                                    <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4 text-center">Qté</th>
                                        <th className="px-6 py-4 text-right">Prix Unit. (HT)</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(order.order_items as any[]).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{item.product_variants?.products?.name || 'Produit'}</span>
                                                    <span className="text-[10px] font-mono text-slate-400">{item.product_variants?.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-light">
                                                {item.qty}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-light">
                                                {(item.net_unit_price_cents / 100).toFixed(2)} CHF
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-primary">
                                                {(item.line_total_cents / 100).toFixed(2)} CHF
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <div className="flex justify-end pr-6">
                        <div className="w-full max-w-xs space-y-3">
                            <div className="flex justify-between text-sm text-slate-500 font-light">
                                <span>Sous-total (HT)</span>
                                <span>{(order.total_base_cents / 100).toFixed(2)} CHF</span>
                            </div>
                            {order.total_discount_cents > 0 && (
                                <div className="flex justify-between text-sm text-red-500 font-light">
                                    <span>Remises</span>
                                    <span>-{(order.total_discount_cents / 100).toFixed(2)} CHF</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-500 font-light">
                                <span>TVA (8.1%)</span>
                                <span>{(order.vat_total_cents / 100).toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500 font-light">
                                <span>Frais de port</span>
                                <span>{((order.shipping_cost_cents || 0) / 100).toFixed(2)} CHF</span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-base font-serif text-primary">TOTAL FINAL</span>
                                <span className="text-2xl font-serif text-primary font-bold">
                                    {(order.total_final_cents / 100).toFixed(2)} CHF
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Client</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{profile?.company_name || 'N/A'}</span>
                                <span className="text-xs text-slate-500">{profile?.full_name}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Mail className="w-3.5 h-3.5" /> {profile?.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Phone className="w-3.5 h-3.5" /> {profile?.phone_personal || profile?.phone_pro || 'N/A'}
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400">
                                TIER: {profile?.level}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Livraison</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 text-xs font-light text-slate-600 leading-relaxed">
                            {shipping?.line1}<br />
                            {shipping?.postal_code} {shipping?.city}<br />
                            {shipping?.country}
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Paiement</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Méthode</span>
                                <span className="text-xs font-medium text-slate-600 italic">
                                    {(order as any).payment_method === 'bank_transfer' ? 'Virement Bancaire' : (order as any).payment_method || 'Stripe / Carte'}
                                </span>
                            </div>
                            {(order as any).paid_at && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payé le</span>
                                    <span className="text-xs font-medium text-emerald-600">
                                        {new Date((order as any).paid_at).toLocaleDateString('fr-CH')}
                                    </span>
                                </div>
                            )}
                            {order.invoice_number && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Numéro Facture</span>
                                    <span className="text-xs font-mono font-bold text-primary">
                                        {order.invoice_number}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    if (status === 'PAID') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1 w-fit text-[10px] px-2 py-1"><CheckCircle2 size={12} /> PAYÉ</Badge>
    if (status === 'PENDING') return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none flex items-center gap-1 w-fit text-[10px] px-2 py-1"><Clock size={12} /> EN ATTENTE</Badge>
    if (status === 'CANCELLED') return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none flex items-center gap-1 w-fit text-[10px] px-2 py-1"><XCircle size={12} /> ANNULÉ</Badge>
    return <Badge variant="outline" className="text-slate-400 uppercase text-[10px] px-2 py-1 font-light border-slate-200">{status}</Badge>
}
