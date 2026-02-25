import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const D: Record<string, string> = {
    faq_title: 'Questions Fréquentes',
    faq_subtitle: 'Tout ce que vous devez savoir sur nos produits et notre réseau de distribution',
    faq_q1: "Qui peut commander des produits KRX Aesthetics?",
    faq_a1: "Nos produits sont réservés aux professionnels de l'esthétique: esthéticiennes diplômées, dermatologues, médecins esthétiques, instituts de beauté et cliniques. Une vérification professionnelle est requise avant toute commande.",
    faq_q2: "Comment devenir partenaire distributeur?",
    faq_a2: "Remplissez le formulaire de demande d'accès professionnel sur notre plateforme. Notre équipe vérifiera vos qualifications et vous contactera dans les 48 heures.",
    faq_q3: "Quels sont les délais de livraison en Suisse?",
    faq_a3: "Les commandes sont expédiées depuis notre dépôt de Vufflens-la-Ville. Les délais sont de 1 à 3 jours ouvrables pour toute la Suisse.",
    faq_q4: "Les produits KRX sont-ils certifiés pour la Suisse?",
    faq_a4: "Oui, tous nos produits sont conformes à l'Ordonnance sur les Cosmétiques (OCos) suisse et disposent des certifications KFDA, CGMP et ISO 22716.",
    faq_q5: "Proposez-vous des formations?",
    faq_a5: "Oui, DermaKor Academy propose des formations certifiées pour tous nos traitements professionnels, notamment le Green Sea Peel. Certains produits nécessitent une formation obligatoire avant utilisation.",
    faq_q6: "Quels modes de paiement acceptez-vous?",
    faq_a6: "Nous acceptons Visa, Mastercard, American Express, Twint, PayPal, PostFinance et le virement bancaire.",
    faq_q7: "Puis-je retourner un produit?",
    faq_a7: "Les retours sont acceptés dans les 14 jours suivant la réception, à condition que les produits soient non ouverts et dans leur emballage d'origine. Consultez nos CGV pour plus de détails.",
    faq_q8: "Y a-t-il un montant minimum de commande?",
    faq_a8: "Pour les nouvelles commandes professionnelles, un montant minimum peut s'appliquer. Contactez notre équipe pour connaître les conditions actuelles.",
    faq_q9: "Comment fonctionne l'exclusivité territoriale?",
    faq_a9: "Nous offrons une protection de zone par canton aux partenaires qualifiés, garantissant une distribution exclusive dans votre région.",
    faq_q10: "Comment contacter le support technique?",
    faq_a10: "Vous pouvez nous joindre par téléphone au +41 78 326 71 51, par email à info@dermakorswiss.com, ou via WhatsApp pendant nos heures d'ouverture (Lun-Ven: 9h00-16h00).",
}

export default async function FAQEditorPage() {
    const content = await getPageContents('faq', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">Foire Aux Questions</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Gérez les 10 questions/réponses de la page FAQ.</p>
                    </div>
                </div>
                <Link href="/faq" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="faq"
                pageName="FAQ"
                currentContent={content}
                defaultContent={D}
                sections={[
                    {
                        title: 'Header FAQ',
                        fields: [
                            { key: 'faq_title', label: 'Titre de la page', type: 'text', placeholder: D.faq_title },
                            { key: 'faq_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: D.faq_subtitle },
                        ]
                    },
                    ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({
                        title: `Question ${i}`,
                        fields: [
                            { key: `faq_q${i}`, label: `Question ${i}`, type: 'text' as const, placeholder: D[`faq_q${i}`] },
                            { key: `faq_a${i}`, label: `Réponse ${i}`, type: 'textarea' as const, placeholder: D[`faq_a${i}`] },
                        ]
                    })))
                ]}
            />
        </div>
    )
}
