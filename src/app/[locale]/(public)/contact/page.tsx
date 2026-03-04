'use client'

import React, { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { getPageContents, type Locale } from '@/domains/admin/cms-actions'
import { toast } from 'sonner'

export default function ContactPage() {
    const locale = useLocale()
    const [cms, setCms] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            const data = await getPageContents('contact', locale as Locale)
            setCms(data)
        }
        load()
    }, [locale])

    const DEFAULTS: Record<string, string> = {
        contact_title: 'Contactez-Nous',
        contact_subtitle: 'Notre équipe est à votre disposition pour toute question ou demande de partenariat.',
        footer_phone: '+41 78 326 71 51',
        footer_email: 'info@dermakorswiss.com',
        footer_address1: 'Chem. des Champs Courbes 1, 1024 Ecublens',
        footer_hours: 'Lun-Ven: 9h00 – 16h00',
    }

    const g = (key: string) => cms[key] || DEFAULTS[key] || ''

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            event: 'contact_form',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        }

        try {
            const res = await fetch('https://jorge2812.app.n8n.cloud/webhook/1c994d86-492b-407a-bca3-018303d13921', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                toast.success('Message envoyé avec succès. Nous vous contacterons sous peu.')
                    ; (e.target as HTMLFormElement).reset()
            } else {
                toast.error('Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.')
            }
        } catch (error) {
            toast.error('Erreur de connexion. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-[#FAFAF8] min-h-screen pt-8 md:pt-32 pb-16 md:pb-24">
            <div className="container mx-auto px-5 md:px-6 max-w-7xl">
                <header className="text-center mb-10 md:mb-16">
                    <h1 className="font-oswald text-3xl md:text-4xl lg:text-6xl font-bold text-[#C0A76A] uppercase tracking-tight mb-4 md:mb-6">
                        {g('contact_title')}
                    </h1>
                    <p className="text-[#6B6560] text-lg max-w-2xl mx-auto italic">
                        {g('contact_subtitle')}
                    </p>
                    <div className="w-24 h-px bg-[#C0A76A] mx-auto mt-10" />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                    {/* Left: Form */}
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E8E4DC]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormGroup label="Nom complet *" name="name" required />
                                <FormGroup label="Email *" name="email" type="email" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormGroup label="Téléphone" name="phone" type="tel" />
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#262626]">Sujet *</label>
                                    <select
                                        name="subject"
                                        required
                                        className="w-full bg-[#FAFAF8] border border-[#E8E4DC] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C0A76A] transition-colors"
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        <option value="Question produit">Question produit</option>
                                        <option value="Demande de distribution">Demande de distribution</option>
                                        <option value="Support technique">Support technique</option>
                                        <option value="Formation">Formation</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-[#262626]">Message *</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    className="w-full bg-[#FAFAF8] border border-[#E8E4DC] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C0A76A] transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 min-h-[52px] bg-[#C0A76A] text-white font-oswald text-sm uppercase tracking-[3px] font-bold hover:bg-[#A8914F] transition-all flex items-center justify-center gap-3 disabled:opacity-50 tap-scale"
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer le Message'}
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-8">
                        <div className="bg-[#F5F0EB] p-8 md:p-12 rounded-2xl">
                            <h2 className="font-oswald text-2xl font-bold text-[#262626] uppercase tracking-wide mb-10">
                                Informations de Contact
                            </h2>

                            <div className="space-y-8">
                                <ContactInfo icon={<Phone />} title="Téléphone" value={g('footer_phone')} />
                                <ContactInfo icon={<Mail />} title="Email" value={g('footer_email')} />
                                <ContactInfo icon={<MapPin />} title="Adresse" value={g('footer_address1')} />
                                <ContactInfo icon={<Clock />} title="Horaires" value={g('footer_hours')} />
                            </div>

                            <div className="mt-12 pt-10 border-t border-[#C0A76A]/20">
                                <a
                                    href={`https://wa.me/${g('footer_phone').replace(/\s+/g, '')}`}
                                    className="flex items-center gap-4 text-[#C0A76A] hover:text-[#262626] transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                        <MessageCircle size={24} />
                                    </div>
                                    <span className="font-oswald text-sm font-bold uppercase tracking-widest">
                                        Support WhatsApp Direct
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Map placeholder */}
                        <div className="h-64 rounded-2xl bg-[#E8E4DC] flex items-center justify-center text-[#8A8578] overflow-hidden group">
                            <div className="text-center p-6 grayscale transition-all duration-700 group-hover:grayscale-0">
                                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="font-oswald text-xs uppercase tracking-widest">Ecublens, Suisse</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FormGroup({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#262626]">{label}</label>
            <input
                type={type}
                name={name}
                required={required}
                className="w-full bg-[#FAFAF8] border border-[#E8E4DC] rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#C0A76A] transition-colors min-h-[48px]"
            />
        </div>
    )
}

function ContactInfo({ icon, title, value }: { icon: React.ReactElement; title: string; value: string }) {
    return (
        <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#C0A76A] shadow-sm shrink-0">
                {React.cloneElement(icon, { size: 18 } as any)}
            </div>
            <div className="space-y-1">
                <h4 className="font-oswald text-[10px] uppercase tracking-[3px] text-[#8A8578]">
                    {title}
                </h4>
                <p className="text-[#262626] font-medium leading-relaxed italic">
                    {value}
                </p>
            </div>
        </div>
    )
}
