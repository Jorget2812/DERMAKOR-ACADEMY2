import { listProductsPublic } from '@/domains/commerce/actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { Eye } from 'lucide-react'

export default async function PublicShopPage() {
    const products = await listProductsPublic()

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl mb-4">Notre Boutique</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Découvrez notre gamme exclusive de produits de dermo-esthétique haute performance.
                    Connectez-vous pour voir les prix et commander.
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
                        <div className="aspect-square bg-secondary relative overflow-hidden">
                            {/* Placeholder for product image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-50">
                                <Package size={48} strokeWidth={1} />
                            </div>
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                        </div>
                        <CardHeader className="p-6">
                            <CardTitle className="text-lg group-hover:text-accent transition-colors">{product.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                            <div className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                <span>Professionnel</span>
                                <span className="text-accent underline">Prix masqué</span>
                            </div>
                            <Link href={`/shop/${product.slug}`} className="w-full">
                                <Button className="w-full group-hover:bg-accent transition-colors" variant="secondary">
                                    <Eye className="w-4 h-4 mr-2" /> Voir le produit
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-24">
                    <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
                </div>
            )}
        </div>
    )
}

function Package(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7.5 4.27 12 7l4.5-2.73L12 1.5z" />
            <path d="M18 10V5c0-1.1-.9-2-2-2h-1" />
            <path d="M6 10V5c0-1.1.9-2 2-2h1" />
            <rect width="20" height="13" x="2" y="10" rx="2" />
            <path d="M12 22V13" />
            <path d="M17 13l-5 5-5-5" />
        </svg>
    )
}
