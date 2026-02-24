import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const PAGE_DEFAULTS: Record<string, string> = {
    page_title: "Notre Boutique",
    page_subtitle: "Découvrez notre gamme exclusive de produits de dermo-esthétique haute performance. Connectez-vous pour voir les prix et commander.",
}

export default async function ShopPageEditor() {
    const content = await getPageContents('shop', 'fr')

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                            <ArrowLeft size={16} /> Pages
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif text-primary">La Boutique</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Modifiez le titre et le sous-titre de la boutique publique.</p>
                    </div>
                </div>
                <Link href="/shop" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="shop"
                pageName="La Boutique"
                currentContent={content}
                defaultContent={PAGE_DEFAULTS}
                sections={[
                    {
                        title: "🛍️ En-tête de la Boutique",
                        fields: [
                            { key: 'page_title', label: 'Titre Principal', type: 'text', placeholder: PAGE_DEFAULTS.page_title },
                            { key: 'page_subtitle', label: 'Sous-titre', type: 'textarea', description: 'Message affiché sous le titre, visible par tous les visiteurs.', placeholder: PAGE_DEFAULTS.page_subtitle },
                        ]
                    },
                ]}
            />
        </div>
    )
}
