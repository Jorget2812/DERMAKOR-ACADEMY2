import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const D: Record<string, string> = {
    cgv_content: "Les conditions générales de vente seront publiées prochainement.",
}

export default async function CGVEditorPage() {
    const content = await getPageContents('cgv', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">CGV</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Conditions Générales de Vente.</p>
                    </div>
                </div>
                <Link href="/cgv" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="cgv"
                pageName="CGV"
                currentContent={content}
                defaultContent={D}
                sections={[
                    {
                        title: 'Contenu CGV',
                        fields: [
                            { key: 'cgv_content', label: 'Texte des CGV (HTML/Rich Text)', type: 'textarea', placeholder: D.cgv_content },
                        ]
                    },
                ]}
            />
        </div>
    )
}
