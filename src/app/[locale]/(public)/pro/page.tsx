'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VerificationRequestSchema, VerificationRequestForm } from '@/domains/auth-verification/types'
import { submitVerification } from '@/domains/auth-verification/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle2, Loader2, MapPin, Mail, Phone, Clock } from 'lucide-react'

const PROFESSIONAL_TYPES = [
    "Estheticien(ne)",
    "Medecin Esthetique",
    "Clinique",
    "Spa / Wellness",
    "Autre",
]

const REQUEST_OBJECTS = [
    "Demande d'Acces Pro (Catalogue & Tarifs)",
    "Renseignement Formations",
    "Information Produits",
    "Partenariat / Distribution",
]

export default function ProfessionalAccessPage() {
    const [isSuccess, setIsSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<VerificationRequestForm>({
        resolver: zodResolver(VerificationRequestSchema),
        defaultValues: {
            fullName: '',
            email: '',
            companyName: '',
            ideSituation: '',
            phonePro: '',
            expertiseDomain: '',
            addressPro: '',
            canton: '',
            professionalType: '',
            requestObject: "Demande d'Acces Pro (Catalogue & Tarifs)",
            message: '',
        }
    })

    async function onSubmit(data: VerificationRequestForm) {
        setLoading(true)
        const result = await submitVerification(data)
        setLoading(false)
        if (result.success) {
            setIsSuccess(true)
            toast.success("Demande envoyee avec succes")
        } else {
            toast.error(result.error || "Une erreur est survenue")
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-4 py-24">
                <Card className="max-w-md w-full text-center p-8 border-[#C0A76A]/20 shadow-xl">
                    <CheckCircle2 className="w-16 h-16 text-[#C0A76A] mx-auto mb-6" />
                    <CardTitle className="mb-4 font-serif text-2xl">Demande Recue</CardTitle>
                    <CardDescription className="text-base">
                        Merci pour votre interet. Votre demande est en cours d examen.
                        Vous recevrez un e-mail de confirmation sous 24h a 48h ouvrables.
                    </CardDescription>
                    <Button asChild className="mt-8 bg-[#C0A76A] hover:bg-[#C0A76A]/90 text-white">
                        <a href="/">Retour a l accueil</a>
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F3EF]">
            <div className="max-w-6xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C0A76A] mb-3">Espace Professionnel</p>
                    <h1 className="font-serif text-4xl md:text-5xl text-[#1C1C1C] mb-4">Acces Professionnels</h1>
                    <p className="text-[rgba(0,0,0,0.55)] max-w-xl mx-auto">
                        Remplissez ce formulaire pour demander votre acces aux tarifs professionnels et a notre catalogue exclusif.
                        <strong className="text-[#1C1C1C]"> Validation de votre compte sous 24h a 48h ouvrables.</strong>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="border-[#C0A76A]/15 shadow-sm bg-white">
                            <CardContent className="p-6 space-y-5">
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-lg bg-[#C0A76A]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={16} className="text-[#C0A76A]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#C0A76A] mb-1">Siege Social</p>
                                        <p className="text-sm text-[#1C1C1C] leading-relaxed">
                                            DermaKor Swiss Sarl<br />
                                            Chemin des Champs-Courbes 1<br />
                                            1024 Ecublens, Suisse
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-lg bg-[#C0A76A]/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={16} className="text-[#C0A76A]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#C0A76A] mb-1">Email</p>
                                        <p className="text-sm text-[#1C1C1C]">info@dermakorswiss.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-lg bg-[#C0A76A]/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={16} className="text-[#C0A76A]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#C0A76A] mb-1">Telephone</p>
                                        <p className="text-sm text-[#1C1C1C]">+41 78 326 71 51</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-lg bg-[#C0A76A]/10 flex items-center justify-center flex-shrink-0">
                                        <Clock size={16} className="text-[#C0A76A]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#C0A76A] mb-1">Horaires</p>
                                        <p className="text-sm text-[#1C1C1C] leading-relaxed">
                                            Lundi - Vendredi: 09:00 - 18:00<br />
                                            Samedi: Sur rendez-vous
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="border-[#C0A76A]/15 shadow-sm bg-white">
                            <CardContent className="p-8">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Nom complet *</Label>
                                            <Input {...form.register('fullName')} placeholder="Votre nom" className="h-11 border-[rgba(0,0,0,0.12)] focus:border-[#C0A76A]" />
                                            {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Societe / Institut *</Label>
                                            <Input {...form.register('companyName')} placeholder="Nom de votre etablissement" className="h-11 border-[rgba(0,0,0,0.12)] focus:border-[#C0A76A]" />
                                            {form.formState.errors.companyName && <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Email professionnel *</Label>
                                            <Input {...form.register('email')} type="email" placeholder="pro@votre-domaine.com" className="h-11 border-[rgba(0,0,0,0.12)] focus:border-[#C0A76A]" />
                                            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Telephone *</Label>
                                            <Input {...form.register('phonePro')} placeholder="+41 XX XXX XX XX" className="h-11 border-[rgba(0,0,0,0.12)] focus:border-[#C0A76A]" />
                                            {form.formState.errors.phonePro && <p className="text-xs text-destructive">{form.formState.errors.phonePro.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Canton / Region *</Label>
                                            <Input {...form.register('canton')} placeholder="Ex: Vaud" className="h-11 border-[rgba(0,0,0,0.12)] focus:border-[#C0A76A]" />
                                            {form.formState.errors.canton && <p className="text-xs text-destructive">{form.formState.errors.canton.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Type de professionnel *</Label>
                                            <select {...form.register('professionalType')} className="w-full h-11 px-3 rounded-md border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C0A76A]">
                                                <option value="">Selectionner...</option>
                                                {PROFESSIONAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            {form.formState.errors.professionalType && <p className="text-xs text-destructive">{form.formState.errors.professionalType.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Objet de la demande *</Label>
                                        <select {...form.register('requestObject')} className="w-full h-11 px-3 rounded-md border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C0A76A]">
                                            {REQUEST_OBJECTS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C]">Message</Label>
                                        <textarea {...form.register('message')} placeholder="Comment pouvons-nous vous aider ?" rows={4} className="w-full px-3 py-2.5 rounded-md border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1C1C1C] resize-none focus:outline-none focus:border-[#C0A76A]" />
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full bg-[#1C1C1C] hover:bg-[#C0A76A] text-white h-12 text-sm font-bold uppercase tracking-widest transition-colors duration-300">
                                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Envoyer ma demande"}
                                    </Button>
                                    <p className="text-center text-xs text-[rgba(0,0,0,0.4)]">
                                        En soumettant ce formulaire, vous acceptez notre politique de confidentialite. Vos donnees sont traitees conformement au RGPD.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}