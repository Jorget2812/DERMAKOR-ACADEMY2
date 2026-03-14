import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Truck, CreditCard, Calendar, Info, MapPin, Download, FileText } from "lucide-react"
import { Link } from '@/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CancelOrderButton } from '@/domains/commerce/components/CancelOrderButton'

interface OrderPageProps {
    params: Promise<{ id: string; locale: string }>
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id, qty,
                gross_unit_price_cents,
                net_unit_price_cents,
                vat_amount_cents,
                line_total_cents,
                product_variants (
                    sku,
                    products ( name )
                )
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('[OrderDetail] Query error:', JSON.stringify(error))
        notFound()
    }
    if (!order) notFound()

    const shipping = order.shipping_address as any
    const isPending = order.status === 'PENDING'
    const isPaid = order.status === 'PAID'

    // Generate signed URL for invoice if PAID
    let invoiceSignedUrl: string | null = null
    if (isPaid && (order as any).invoice_pdf_path) {
        const { data: urlData } = await supabase.storage
            .from('invoices')
            .createSignedUrl((order as any).invoice_pdf_path, 3600)
        invoiceSignedUrl = urlData?.signedUrl || null
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link href="/app/orders" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft size={14} /> Retour aux commandes
                    </Link>
                    <h1 className="text-3xl font-serif">Commande {order.invoice_number || order.id.substring(0, 8)}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {order.created_at ? format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr }) : '-'}
                        </span>
                        <span>•</span>
                        <Badge variant={order.status === 'PAID' ? 'default' : 'secondary'} className={order.status === 'PAID' ? 'bg-green-100 text-green-700 border-none' : ''}>
                            {order.status}
                        </Badge>
                    </div>
                </div>
                {isPaid && invoiceSignedUrl && (
                    <a href={invoiceSignedUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2 bg-primary hover:bg-accent text-white text-xs" size="sm">
                            <Download size={14} /> Télécharger la Facture
                        </Button>
                    </a>
                )}
                {isPaid && !invoiceSignedUrl && (
                    <Button variant="outline" size="sm" className="gap-2 text-xs opacity-60" disabled>
                        <FileText size={14} /> Facture en cours de génération
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package size={18} className="text-accent" /> Articles commandés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                                            <th className="text-left py-3 font-medium">Produit</th>
                                            <th className="text-center py-3 font-medium">Qté</th>
                                            <th className="text-right py-3 font-medium">
                                                <span className="hidden sm:inline">Prix Unit. HT (CHF)</span>
                                                <span className="sm:hidden">P.U.</span>
                                            </th>
                                            <th className="text-right py-3 font-medium">
                                                <span className="hidden sm:inline">Total HT (CHF)</span>
                                                <span className="sm:hidden">Total</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {order.order_items.map((item: any) => (
                                            <tr key={item.id} className="group">
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium group-hover:text-accent transition-colors">
                                                            {item.product_variants?.products?.name || 'Produit'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter">
                                                            SKU: {item.product_variants?.sku || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center font-medium">{item.qty}</td>
                                                <td className="py-4 text-right text-slate-700">
                                                    {((item.net_unit_price_cents || item.gross_unit_price_cents) / 100).toFixed(2)}
                                                </td>
                                                <td className="py-4 text-right font-serif font-bold">
                                                    {(((item.net_unit_price_cents || item.gross_unit_price_cents) * item.qty) / 100).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {isPending && (
                        <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
                            <CardHeader className="bg-amber-100/50 py-3 border-b border-amber-200">
                                <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                    <Info size={16} /> Instructions de paiement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-5 text-sm space-y-3 text-amber-900/80">
                                <p>Votre commande est en attente de paiement par virement bancaire.</p>
                                <div className="bg-white/60 p-3 rounded border border-amber-200/50 font-mono text-[13px] space-y-1">
                                    <p><span className="text-amber-600 font-sans uppercase text-[10px] tracking-widest font-bold block">Référence à inclure :</span> {order.invoice_number}</p>
                                </div>
                                <p className="text-xs italic">Dès réception de votre virement, votre commande sera confirmée et expédiée.</p>
                            </CardContent>
                        </Card>
                    )}
                    {isPending && (
                        <div className="pt-2">
                            <CancelOrderButton orderId={order.id} />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-border/50 bg-secondary/10 shadow-sm overflow-hidden">
                        <div className="bg-primary/5 px-6 py-4 border-b border-border/30">
                            <CardTitle className="text-lg flex items-center gap-2 font-serif italic">
                                <CreditCard size={18} className="text-accent" /> Résumé
                            </CardTitle>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sous-total (HT)</span>
                                    <span>{(order.total_base_cents / 100).toFixed(2)} CHF</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">TVA (8.1%)</span>
                                    <span>{(order.vat_total_cents / 100).toFixed(2)} CHF</span>
                                </div>
                                {(order as any).shipping_price_cents > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Livraison {(order as any).shipping_method === 'EXPRESS' ? 'Express' : 'Standard'}
                                        </span>
                                        <span>{((order as any).shipping_price_cents / 100).toFixed(2)} CHF</span>
                                    </div>
                                )}
                                <div className="border-t border-border/30 my-2" />
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="font-bold">Total Final</span>
                                    <span className="text-2xl font-serif font-bold text-primary">
                                        {(order.total_final_cents / 100).toFixed(2)} <small className="text-xs font-sans font-normal opacity-70">CHF</small>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Truck size={16} className="text-accent" /> Livraison
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="flex gap-3">
                                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-700">{shipping?.fullName || shipping?.full_name}</p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {shipping?.street || shipping?.address_line1}<br />
                                        {shipping?.postalCode || shipping?.postal_code} {shipping?.city}<br />
                                        {shipping?.country === 'CH' ? 'Suisse' : shipping?.country}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}