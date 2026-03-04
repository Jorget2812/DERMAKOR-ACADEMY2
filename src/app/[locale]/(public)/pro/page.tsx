'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VerificationRequestSchema, VerificationRequestForm } from '@/domains/auth-verification/types'
import { submitVerification } from '@/domains/auth-verification/actions'
import { toast } from "sonner"
import {
    CheckCircle2,
    Loader2,
    User,
    Briefcase,
    MapPin,
    MessageSquare,
    GraduationCap,
    ShieldCheck
} from 'lucide-react'
import { Link } from '@/navigation'

const PROFESSIONAL_TYPES = [
    "Esthéticienne",
    "Dermatologue",
    "Médecin esthétique",
    "Institut de beauté",
    "Clinique dermatologique",
    "Spa / Centre wellness",
    "Autre",
]

const IDE_SITUATIONS = [
    "J'ai un numéro IDE",
    "Je n'ai pas encore de numéro IDE",
    "En cours d'obtention",
]

const CANTONS = [
    "Genève",
    "Vaud",
    "Valais",
    "Fribourg",
    "Neuchâtel",
    "Jura",
    "Berne",
    "Zürich",
    "Bâle-Ville",
    "Bâle-Campagne",
    "Lucerne",
    "Tessin",
    "Autre canton",
]

const REQUEST_OBJECTS = [
    "Devenir partenaire distributeur",
    "Commander des produits professionnels",
    "Demande de formation",
    "Demande d'information",
    "Autre",
]

/* ─── Shared input styles ─── */
const inputClass = "w-full px-4 py-3 text-base text-[#1e1e1e] bg-[#FAFAF8] border border-[#E8E4DC] rounded-lg placeholder:text-[#B0A898] focus:outline-none focus:border-[#C0A76A] focus:ring-2 focus:ring-[#C0A76A]/20 transition-all duration-300 min-h-[48px]"
const selectClass = `${inputClass} appearance-none cursor-pointer`
const labelClass = "block text-sm font-medium text-[#1e1e1e] mb-1.5"
const errorClass = "text-xs text-[#DC3545] mt-1"

export default function ProfessionalAccessPage() {
    const [isSuccess, setIsSuccess] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const form = useForm<VerificationRequestForm>({
        resolver: zodResolver(VerificationRequestSchema),
        mode: 'onBlur',
        defaultValues: {
            fullName: '',
            email: '',
            phonePro: '',
            companyName: '',
            professionalType: '',
            ideSituation: '',
            ideNumber: '',
            addressPro: '',
            canton: '',
            website: '',
            requestObject: '',
            message: '',
        }
    })

    const ideSituation = form.watch('ideSituation')
    const { errors, isValid } = form.formState

    async function onSubmit(data: VerificationRequestForm) {
        setLoading(true)
        const result = await submitVerification(data)
        setLoading(false)
        if (result.success) {
            setSubmittedEmail(data.email)
            setIsSuccess(true)
        } else {
            toast.error(result.error || "Une erreur est survenue")
        }
    }

    /* ═══════════════════════════════════════════ */
    /*  SUCCESS SCREEN                             */
    /* ═══════════════════════════════════════════ */
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-24">
                <div className="max-w-md w-full text-center bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                    {/* Animated gold check */}
                    <div className="relative mx-auto w-20 h-20 mb-8">
                        <div className="absolute inset-0 rounded-full bg-[#C0A76A]/10 animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#C0A76A] to-[#A8914F] flex items-center justify-center shadow-lg shadow-[#C0A76A]/30">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h2 className="font-oswald text-2xl uppercase tracking-wider text-[#C0A76A] mb-4">
                        Demande envoyée avec succès
                    </h2>
                    <p className="text-[#8A8578] text-sm leading-relaxed mb-8">
                        Notre équipe examinera votre demande dans les plus brefs délais.
                        Vous recevrez un email de confirmation à{' '}
                        <span className="font-semibold text-[#1e1e1e]">{submittedEmail}</span>.
                    </p>

                    <Link
                        href="/"
                        className="inline-block w-full py-4 px-8 text-white text-sm font-oswald uppercase tracking-[2px] rounded-lg bg-gradient-to-br from-[#C0A76A] to-[#A8914F] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C0A76A]/30 transition-all duration-300"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        )
    }

    /* ═══════════════════════════════════════════ */
    /*  FORM PAGE                                  */
    /* ═══════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-10 md:py-24">

                {/* ── Header ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C0A76A] to-[#A8914F] shadow-lg shadow-[#C0A76A]/20 mb-6">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-oswald text-2xl md:text-3xl lg:text-4xl uppercase tracking-wider text-[#C0A76A] mb-3">
                        Demande d&apos;Accès Professionnel
                    </h1>
                    <p className="text-[#8A8578] text-sm max-w-md mx-auto leading-relaxed">
                        Réservé aux professionnels de l&apos;esthétique et de la dermatologie en Suisse
                    </p>
                </div>

                {/* ── Form Card ── */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                        {/* ══════════════════════════════════════ */}
                        {/*  SECTION 1: INFORMATIONS PERSONNELLES  */}
                        {/* ══════════════════════════════════════ */}
                        <section>
                            <SectionHeader icon={User} title="Informations Personnelles" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nom complet *</label>
                                    <input
                                        {...form.register('fullName')}
                                        placeholder="Prénom et nom"
                                        className={`${inputClass} ${errors.fullName ? '!border-[#DC3545]' : ''}`}
                                    />
                                    {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Email professionnel *</label>
                                    <input
                                        {...form.register('email')}
                                        type="email"
                                        placeholder="pro@votre-domaine.com"
                                        className={`${inputClass} ${errors.email ? '!border-[#DC3545]' : ''}`}
                                    />
                                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Téléphone professionnel *</label>
                                    <input
                                        {...form.register('phonePro')}
                                        type="tel"
                                        placeholder="+41 XX XXX XX XX"
                                        className={`${inputClass} ${errors.phonePro ? '!border-[#DC3545]' : ''}`}
                                    />
                                    {errors.phonePro && <p className={errorClass}>{errors.phonePro.message}</p>}
                                </div>
                            </div>
                        </section>

                        <Divider />

                        {/* ══════════════════════════════════════════ */}
                        {/*  SECTION 2: INFORMATIONS PROFESSIONNELLES */}
                        {/* ══════════════════════════════════════════ */}
                        <section>
                            <SectionHeader icon={Briefcase} title="Informations Professionnelles" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Raison sociale / Établissement *</label>
                                    <input
                                        {...form.register('companyName')}
                                        placeholder="Nom de votre établissement"
                                        className={`${inputClass} ${errors.companyName ? '!border-[#DC3545]' : ''}`}
                                    />
                                    {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Type de professionnel *</label>
                                    <select
                                        {...form.register('professionalType')}
                                        className={`${selectClass} ${errors.professionalType ? '!border-[#DC3545]' : ''}`}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {PROFESSIONAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    {errors.professionalType && <p className={errorClass}>{errors.professionalType.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Situation IDE *</label>
                                    <select
                                        {...form.register('ideSituation')}
                                        className={`${selectClass} ${errors.ideSituation ? '!border-[#DC3545]' : ''}`}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {IDE_SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {errors.ideSituation && <p className={errorClass}>{errors.ideSituation.message}</p>}
                                </div>

                                {/* Conditional: IDE Number */}
                                {ideSituation === "J'ai un numéro IDE" && (
                                    <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className={labelClass}>Numéro IDE</label>
                                        <input
                                            {...form.register('ideNumber')}
                                            placeholder="CHE-123.456.789"
                                            className={inputClass}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <Divider />

                        {/* ═══════════════════════════════════ */}
                        {/*  SECTION 3: ADRESSE PROFESSIONNELLE */}
                        {/* ═══════════════════════════════════ */}
                        <section>
                            <SectionHeader icon={MapPin} title="Adresse Professionnelle" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Adresse professionnelle *</label>
                                    <input
                                        {...form.register('addressPro')}
                                        placeholder="Rue et numéro, NPA Ville"
                                        className={`${inputClass} ${errors.addressPro ? '!border-[#DC3545]' : ''}`}
                                    />
                                    {errors.addressPro && <p className={errorClass}>{errors.addressPro.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Canton / Région *</label>
                                    <select
                                        {...form.register('canton')}
                                        className={`${selectClass} ${errors.canton ? '!border-[#DC3545]' : ''}`}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {CANTONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.canton && <p className={errorClass}>{errors.canton.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Site web</label>
                                    <input
                                        {...form.register('website')}
                                        type="url"
                                        placeholder="https://www.votreclinique.ch"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        <Divider />

                        {/* ═════════════════════════ */}
                        {/*  SECTION 4: VOTRE DEMANDE */}
                        {/* ═════════════════════════ */}
                        <section>
                            <SectionHeader icon={MessageSquare} title="Votre Demande" />
                            <div className="space-y-5 mt-6">
                                <div>
                                    <label className={labelClass}>Objet de la demande *</label>
                                    <select
                                        {...form.register('requestObject')}
                                        className={`${selectClass} ${errors.requestObject ? '!border-[#DC3545]' : ''}`}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {REQUEST_OBJECTS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    {errors.requestObject && <p className={errorClass}>{errors.requestObject.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Message</label>
                                    <textarea
                                        {...form.register('message')}
                                        rows={4}
                                        placeholder="Décrivez votre demande ou ajoutez des informations complémentaires..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Submit ── */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-8 min-h-[52px] text-white text-base font-oswald uppercase tracking-[2px] rounded-lg bg-gradient-to-br from-[#C0A76A] to-[#A8914F] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C0A76A]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 flex items-center justify-center gap-3 tap-scale"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    "Envoyer ma demande"
                                )}
                            </button>
                        </div>

                        {/* ── Legal ── */}
                        <p className="text-center text-xs text-[#B0A898] leading-relaxed">
                            En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                            Vos données sont traitées conformément au RGPD.
                        </p>
                    </form>
                </div>

                {/* ── Footer contact info ── */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-[#B0A898] text-xs">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#C0A76A]" />
                        <span>DermaKor Swiss Sàrl — Ecublens, Suisse</span>
                    </div>
                    <span className="hidden sm:inline">·</span>
                    <span>info@dermakorswiss.com</span>
                    <span className="hidden sm:inline">·</span>
                    <span>+41 78 326 71 51</span>
                </div>
            </div>
        </div>
    )
}

/* ─── Sub-components ─── */

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C0A76A]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#C0A76A]" />
            </div>
            <h3 className="font-oswald text-sm uppercase tracking-[1px] text-[#C0A76A] font-medium">
                {title}
            </h3>
        </div>
    )
}

function Divider() {
    return <div className="border-t border-[#E8E4DC]" />
}