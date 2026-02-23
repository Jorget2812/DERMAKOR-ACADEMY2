'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { login } from '@/domains/auth/auth-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from 'lucide-react'
import { Link } from '@/navigation'

export default function LoginPage() {
    const params = useParams()
    const router = useRouter()
    const locale = params.locale as string
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        formData.append('locale', locale)

        const result = await login(formData)

        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else if (result?.redirect) {
            toast.success("Connexion réussie")
            window.location.href = result.redirect // Use window.location for hard refresh to ensure middleware picks up session
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 bg-[#FDFCFB] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />

            <Card className="max-w-md w-full border-none shadow-2xl bg-white relative z-10">
                <CardHeader className="space-y-4 pt-10 pb-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/5 flex items-center justify-center text-accent mx-auto mb-2 border border-accent/10">
                        <ShieldCheck size={32} />
                    </div>
                    <CardTitle className="text-3xl font-serif text-primary">Accès Professionnel</CardTitle>
                    <CardDescription className="text-sm font-light">
                        Veuillez vous connecter pour accéder à votre dashboard et à l'Académie.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Email professionnel</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="votre@email.ch"
                                required
                                className="h-12 border-slate-100 focus:border-accent transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Mot de passe</Label>
                                <button type="button" className="text-[10px] text-accent hover:underline">Oublié?</button>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-12 border-slate-100 focus:border-accent transition-colors"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 gold-gradient text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full border-none shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all">
                            {loading ? <Loader2 className="animate-spin" /> : "Se Connecter"}
                        </Button>

                        <div className="pt-6 text-center border-t border-slate-50">
                            <p className="text-xs text-muted-foreground font-light">
                                Pas encore de compte pro? <Link href="/pro" className="text-accent font-medium hover:underline ml-1">Faire une demande d'accès</Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
