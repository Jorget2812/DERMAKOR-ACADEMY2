'use client'

import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { getPageContents, type Locale } from '@/domains/admin/cms-actions'

export default function FAQPage() {
    const locale = useLocale()
    const [cms, setCms] = useState<Record<string, string>>({})
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    useEffect(() => {
        const load = async () => {
            const data = await getPageContents('faq', locale as Locale)
            setCms(data)
        }
        load()
    }, [locale])

    const DEFAULTS: Record<string, string> = {
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

    const g = (key: string) => cms[key] || DEFAULTS[key] || ''

    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => ({
        q: g(`faq_q${i}`),
        a: g(`faq_a${i}`)
    }))

    return (
        <div className="bg-[#FAFAF8] min-h-screen pt-8 md:pt-32 pb-16 md:pb-24">
            <div className="container mx-auto px-5 md:px-6 max-w-4xl">
                <header className="text-center mb-10 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="font-oswald text-3xl md:text-4xl lg:text-6xl font-bold text-[#C0A76A] uppercase tracking-tight mb-4 md:mb-6">
                        {g('faq_title')}
                    </h1>
                    <p className="text-[#6B6560] text-lg max-w-2xl mx-auto italic">
                        {g('faq_subtitle')}
                    </p>
                    <div className="w-24 h-px bg-[#C0A76A] mx-auto mt-10" />
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4DC] overflow-hidden">
                    {items.map((item, i) => (
                        <AccordionItem
                            key={i}
                            question={item.q}
                            answer={item.a}
                            isOpen={openIndex === i}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-10 md:mt-16 text-center">
                    <p className="text-[#6B6560] text-sm md:text-base mb-4">
                        Besoin d&apos;aide? Contactez-nous directement.
                    </p>
                    <a href="/fr/contact" className="inline-flex items-center justify-center min-h-[52px] px-8 py-3 bg-[#C0A76A] text-white font-oswald text-xs uppercase tracking-[2px] hover:bg-[#A8914F] transition-colors tap-scale">
                        Nous Contacter
                    </a>
                </div>
            </div>
        </div>
    )
}

function AccordionItem({ question, answer, isOpen, onClick }: {
    question: string; answer: string; isOpen: boolean; onClick: () => void
}) {
    return (
        <div className="border-b border-[#E8E4DC] last:border-0">
            <button
                onClick={onClick}
                className={`w-full text-left p-5 md:p-6 lg:p-8 flex items-center justify-between gap-4 md:gap-6 transition-colors min-h-[56px]
                    ${isOpen ? 'bg-[#FAFAF8]/50' : 'hover:bg-[#FAFAF8]'}`}
            >
                <span className="font-oswald text-base md:text-lg lg:text-xl font-medium text-[#262626] uppercase leading-tight">
                    {question}
                </span>
                <div className={`w-10 h-10 rounded-full border border-[#C0A76A]/20 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? <Minus size={18} className="text-[#C0A76A]" /> : <Plus size={18} className="text-[#C0A76A]" />}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 md:px-8 pb-8 text-[#6B6560] text-base leading-relaxed max-w-3xl italic">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
