'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'

/**
 * Set Password page — Custom token flow (Gmail-prefetch proof).
 *
 * Gmail prefetches GET requests — our link is just a page, not an OTP endpoint.
 * The token is only consumed when the user POSTs the form with their password.
 *
 * URL: /fr/auth/set-password?token=<64-char hex>
 * API: POST /api/auth/set-password { token, password }
 */
function SetPasswordInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    /* ── 1. Success State (Top Priority) ── */
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
                    <p className="text-[#8A8578] text-sm mb-4">Redirection vers la page de connexion...</p>
                    <Loader2 className="w-5 h-5 animate-spin text-[#C0A76A] mx-auto" />
                </div>
            </div>
        )
    }

    // ── 2. Token Validation ──
    if (!token) {
        return <InvalidLink message="Aucun token trouvé dans ce lien." />
    }

    // Password strength score 0-4
    const strength = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length

    const strengthColors = ['bg-[#E8E4DC]', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500']

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (loading || done) return
        setError('')

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.')
            return
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })
            const result = await res.json()

            if (result.error) {
                setError(result.error)
                setLoading(false) // Important to unset loading if error
                return
            }

            if (result.success) {
                setDone(true)
                setLoading(false)
                setTimeout(() => router.push('/fr/login'), 3000)
                return // Exit early
            }
        } catch (err) {
            setError('Erreur réseau. Veuillez réessayer.')
            setLoading(false)
        }
    }

    /* ── Form ── */
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-16">
            <div className="max-w-[440px] w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C0A76A] to-[#A8914F] shadow-lg shadow-[#C0A76A]/20 mb-6">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1e1e1e] mb-2">Créez votre mot de passe</h1>
                    <p className="text-[#8A8578] text-sm leading-relaxed max-w-sm mx-auto">
                        Votre compte professionnel est prêt. Définissez votre mot de passe pour accéder à votre Espace Pro.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
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
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Minimum 8 caractères"
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 pr-12 text-base bg-[#FAFAF8] border border-[#E8E4DC] rounded-xl placeholder:text-[#B0A898] focus:outline-none focus:border-[#C0A76A] focus:ring-2 focus:ring-[#C0A76A]/20 transition-all min-h-[48px]"
                                />
                                <button type="button" tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A898] hover:text-[#8A8578] transition-colors p-1">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {password && (
                                <div className="flex gap-1 mt-1.5">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColors[strength] : 'bg-[#E8E4DC]'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#1e1e1e]">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Répétez le mot de passe"
                                    required
                                    className="w-full px-4 py-3 pr-12 text-base bg-[#FAFAF8] border border-[#E8E4DC] rounded-xl placeholder:text-[#B0A898] focus:outline-none focus:border-[#C0A76A] focus:ring-2 focus:ring-[#C0A76A]/20 transition-all min-h-[48px]"
                                />
                                <button type="button" tabIndex={-1}
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A898] hover:text-[#8A8578] transition-colors p-1">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmPassword && (
                                <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                    {password === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Ne correspondent pas'}
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
                                : 'Créer mon mot de passe'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[#B0A898] mt-6">DermaKor Swiss Sàrl — Ecublens, Suisse</p>
            </div>
        </div>
    )
}

function InvalidLink({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center bg-white rounded-2xl border border-red-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-[#1e1e1e] mb-3">Lien invalide ou expiré</h2>
                <p className="text-[#8A8578] text-sm leading-relaxed mb-2">{message}</p>
                <p className="text-[#8A8578] text-sm leading-relaxed">
                    Contactez l'administrateur pour recevoir un nouvel accès.
                </p>
                <a href="/fr/login" className="mt-6 inline-block text-sm text-[#C0A76A] hover:underline font-medium">
                    Aller à la page de connexion →
                </a>
            </div>
        </div>
    )
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C0A76A] animate-spin" />
            </div>
        }>
            <SetPasswordInner />
        </Suspense>
    )
}
