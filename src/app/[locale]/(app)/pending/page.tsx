import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GraduationCap, Clock, XCircle } from 'lucide-react'

export default async function PendingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status, status, full_name')
        .eq('id', user.id)
        .single()

    // If user is now approved and active, redirect them to app
    if (profile?.verification_status === 'APPROVED' && profile?.status === 'ACTIVE') {
        redirect('/app')
    }

    const isSuspended = profile?.status === 'SUSPENDED'
    const isRejected = profile?.verification_status === 'REJECTED'

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    {isSuspended || isRejected ? (
                        <XCircle className="w-8 h-8 text-red-500" />
                    ) : (
                        <Clock className="w-8 h-8 text-accent" />
                    )}
                </div>

                <div className="flex items-center justify-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    <span className="font-bold text-sm uppercase tracking-widest">
                        Dermakor<span className="text-accent">Academy</span>
                    </span>
                </div>

                {isSuspended ? (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Compte suspendu</h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Votre compte a été suspendu. Veuillez contacter l&apos;administration
                            pour plus d&apos;informations.
                        </p>
                    </>
                ) : isRejected ? (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Vérification refusée</h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Votre demande de vérification professionnelle a été refusée.
                            Veuillez contacter l&apos;administration pour plus d&apos;informations.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-900">Vérification en cours</h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Votre compte est en attente de vérification par notre équipe.
                            Vous recevrez un e-mail dès que votre accès sera activé.
                        </p>
                    </>
                )}

                <p className="text-xs text-gray-400">
                    {profile?.full_name && `Connecté en tant que ${profile.full_name}`}
                </p>

                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-700"
                    >
                        Se déconnecter
                    </button>
                </form>
            </div>
        </div>
    )
}
