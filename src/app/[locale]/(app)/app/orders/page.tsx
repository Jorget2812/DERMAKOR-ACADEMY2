import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Package, Calendar } from "lucide-react"
import { Link } from '@/navigation'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ClientInvoiceButton } from '@/domains/commerce/components/ClientInvoiceButton'

export default async function UserOrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product_variants(sku, products(name)))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const orders = (data as any[]) || []

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif">Mes Commandes</h1>
                <p className="text-muted-foreground mt-1">Historique de vos achats professionnels et factures.</p>
            </header>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <Card className="py-12 text-center border-dashed">
                        <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
                        <Link href="/app/shop" className="mt-4 inline-block">
                            <Button variant="outline">Découvrir la boutique</Button>
                        </Link>
                    </Card>
                ) : (
                    orders.map((order: any) => (
                        <Card key={order.id} className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
                            <div className="bg-secondary/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-border/30">
                                <div className="flex items-center gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Date</p>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Calendar size={14} className="text-accent" />
                                            {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total</p>
                                        <p className="text-sm font-serif font-bold">{(order.total_final_cents / 100).toFixed(2)} CHF</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Statut</p>
                                        <Badge variant={order.status === 'PAID' ? 'default' : 'secondary'} className={order.status === 'PAID' ? 'bg-green-100 text-green-700 border-none' : ''}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {order.status === 'PAID' ? (
                                        <ClientInvoiceButton
                                            orderId={order.id}
                                            invoicePdfPath={(order as any).invoice_pdf_path}
                                        />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 opacity-40 cursor-not-allowed text-xs"
                                            disabled
                                            title={order.status === 'PENDING' ? "Disponible après réception du paiement" : "Non disponible"}
                                        >
                                            <FileText size={14} /> Facture PDF
                                        </Button>
                                    )}
                                    <Link href={`/app/orders/${order.id}`}>
                                        <Button size="sm" className="bg-primary hover:bg-accent transition-colors text-xs">Détails</Button>
                                    </Link>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {order.order_items?.slice(0, 2).map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded bg-slate-50 border flex items-center justify-center text-slate-400">
                                                <Package size={20} />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-sm font-medium">{item.product_variants?.products?.name}</h4>
                                                <p className="text-xs text-muted-foreground">{item.qty} x {(item.gross_unit_price_cents / 100).toFixed(2)} CHF</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.order_items?.length > 2 && (
                                        <p className="text-xs text-muted-foreground pl-16">Et {order.order_items.length - 2} autres articles...</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
