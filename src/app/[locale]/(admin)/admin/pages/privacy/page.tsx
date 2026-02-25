import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const D: Record<string, string> = {
    privacy_content: "La politique de confidentialité sera publiée prochainement.",
}

export default async function PrivacyEditorPage() {
    const content = await getPageContents('privacy', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">Confidentialité</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Gestion de la politique de confidentialité.</p>
                    </div>
                </div>
                <Link href="/confidentialite" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="privacy"
                pageName="Confidentialité"
                currentContent={content}
                defaultContent={D}
                sections={[
                    {
                        title: 'Contenu Confidentialité',
                        fields: [
                            { key: 'privacy_content', label: 'Texte (HTML/Rich Text)', type: 'textarea', placeholder: D.privacy_content },
                        ]
                    },
                ]}
            />
        </div>
    )
}
