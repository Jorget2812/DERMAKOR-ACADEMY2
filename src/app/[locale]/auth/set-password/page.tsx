'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Lock, Eye, EyeOff } from 'lucide-react'

export default function SetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sessionLoading, setSessionLoading] = useState(true)
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false)
    const [done, setDone] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check if session already exists (came via /api/auth/callback code exchange)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setReady(true)
                setSessionLoading(false)
                return
            }
            setSessionLoading(false)
        })

        // Also listen for hash-based token (Supabase PKCE / implicit flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
                    setReady(true)
                    setSessionLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères')
            return
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)
        const { error: updateError } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setDone(true)
        // Short delay so user sees the success state
        setTimeout(() => router.push('/fr/app'), 2000)
    }

    /* ── Success screen ── */
    if (done) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                    <div className="relative mx-auto w-20 h-20 mb-8">
                        <div className="absolute inset-0 rounded-full bg-[#C0A76A]/10 animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#C0A76A] to-[#A8914F] flex items-center justify-center shadow-lg shadow-[#C0A76A]/30">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1e1e1e] mb-3">Mot de passe créé !</h2>
                    <p className="text-[#8A8578] text-sm">Redirection vers votre Espace Professionnel...</p>
                </div>
            </div>
        )
    }

    /* ── Loading session ── */
    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#C0A76A] animate-spin" />
                    <p className="text-[#8A8578] text-sm">Vérification en cours...</p>
                </div>
            </div>
        )
    }

    /* ── No session — invalid/expired link ── */
    if (!ready) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-2xl border border-red-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e1e1e] mb-3">Lien invalide ou expiré</h2>
                    <p className="text-[#8A8578] text-sm leading-relaxed">
                        Ce lien d'invitation a expiré ou a déjà été utilisé.
                        Contactez l'administrateur pour recevoir un nouvel accès.
                    </p>
                    <a
                        href="/fr/login"
                        className="mt-6 inline-block text-sm text-[#C0A76A] hover:underline font-medium"
                    >
                        Aller à la page de connexion →
                    </a>
                </div>
            </div>
        )
    }

    /* ── Set password form ── */
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-16">
            <div className="max-w-[440px] w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C0A76A] to-[#A8914F] shadow-lg shadow-[#C0A76A]/20 mb-6">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1e1e1e] mb-2">
                        Créez votre mot de passe
                    </h1>
                    <p className="text-[#8A8578] text-sm leading-relaxed">
                        Votre compte professionnel est prêt. Définissez votre mot de passe pour accéder à votre espace.
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error banner */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#1e1e1e]">
                                Nouveau mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 caractères"
                                    required
                                    className="w-full px-4 py-3 pr-12 text-base bg-[#FAFAF8] border border-[#E8E4DC] rounded-xl placeholder:text-[#B0A898] focus:outline-none focus:border-[#C0A76A] focus:ring-2 focus:ring-[#C0A76A]/20 transition-all min-h-[48px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A898] hover:text-[#8A8578] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {password && (
                                <div className="flex gap-1 mt-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= (i + 1) * 2
                                                ? i < 1 ? 'bg-red-400' : i < 2 ? 'bg-amber-400' : i < 3 ? 'bg-blue-400' : 'bg-green-500'
                                                : 'bg-[#E8E4DC]'
                                            }`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#1e1e1e]">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Répétez le mot de passe"
                                    required
                                    className="w-full px-4 py-3 pr-12 text-base bg-[#FAFAF8] border border-[#E8E4DC] rounded-xl placeholder:text-[#B0A898] focus:outline-none focus:border-[#C0A76A] focus:ring-2 focus:ring-[#C0A76A]/20 transition-all min-h-[48px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A898] hover:text-[#8A8578] transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Match indicator */}
                            {confirmPassword && (
                                <p className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                    {password === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white font-semibold rounded-xl bg-gradient-to-br from-[#C0A76A] to-[#A8914F] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C0A76A]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 min-h-[52px]"
                        >
                            {loading
                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Création en cours...</>
                                : 'Créer mon mot de passe'
                            }
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[#B0A898] mt-6">
                    DermaKor Swiss Sàrl — Ecublens, Suisse
                </p>
            </div>
        </div>
    )
}
