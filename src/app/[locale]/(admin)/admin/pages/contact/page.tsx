import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const D: Record<string, string> = {
    contact_title: 'Contactez-Nous',
    contact_subtitle: 'Notre équipe est à votre disposition pour toute question ou demande de partenariat.',
}

export default async function ContactEditorPage() {
    const content = await getPageContents('contact', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">Contact</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Gestion des textes de la page contact.</p>
                    </div>
                </div>
                <Link href="/contact" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="contact"
                pageName="Contact"
                currentContent={content}
                defaultContent={D}
                sections={[
                    {
                        title: 'En-tête Contact',
                        fields: [
                            { key: 'contact_title', label: 'Titre de la page', type: 'text', placeholder: D.contact_title },
                            { key: 'contact_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: D.contact_subtitle },
                        ]
                    },
                    {
                        title: '💡 Note',
                        description: 'Les informations de contact (téléphone, email, adresse, horaires) sont partagées avec le Footer et se modifient dans l\'éditeur de la Page d\'Accueil.'
                    }
                ]}
            />
        </div>
    )
}
