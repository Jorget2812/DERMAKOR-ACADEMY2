'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VerificationRequestSchema, VerificationRequestForm } from '@/domains/auth-verification/types'
import { submitVerification } from '@/domains/auth-verification/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle2, Loader2 } from 'lucide-react'

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
        }
    })

    async function onSubmit(data: VerificationRequestForm) {
        setLoading(true)
        const result = await submitVerification(data)
        setLoading(false)

        if (result.success) {
            setIsSuccess(true)
            toast.success("Demande envoyée avec succès")
        } else {
            toast.error(result.error || "Une erreur est survenue")
        }
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-24 flex justify-center">
                <Card className="max-w-md w-full text-center p-8 border-accent/20">
                    <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-6" />
                    <CardTitle className="mb-4">Demande Reçue</CardTitle>
                    <CardDescription className="text-base text-balance">
                        Merci pour votre intérêt. Votre demande est en cours d'examen par nos équipes.
                        Vous recevrez un e-mail de confirmation dès validation de votre compte professionnel.
                    </CardDescription>
                    <Button asChild className="mt-8 bg-accent hover:bg-accent/90">
                        <a href="/">Retour à l'accueil</a>
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-24 flex justify-center">
            <Card className="max-w-2xl w-full shadow-2xl border-border/50">
                <CardHeader className="space-y-4 text-center">
                    <CardTitle className="text-3xl font-serif">Accès Professionnel</CardTitle>
                    <CardDescription className="text-base">
                        Bénéficiez de tarifs exclusifs et accédez à l'Académie Dermakor.
                        Veuillez remplir le formulaire ci-dessous pour vérification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nom complet</Label>
                                <Input {...form.register('fullName')} placeholder="Ex: Jean Dupont" />
                                {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email professionnel</Label>
                                <Input {...form.register('email')} type="email" placeholder="jean@cabinet.ch" />
                                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Raison sociale</Label>
                                <Input {...form.register('companyName')} placeholder="Ex: Cabinet d'Esthétique" />
                                {form.formState.errors.companyName && <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ideSituation">Situation IDE / TVA</Label>
                                <Input {...form.register('ideSituation')} placeholder="Ex: CHE-123.456.789" />
                                {form.formState.errors.ideSituation && <p className="text-xs text-destructive">{form.formState.errors.ideSituation.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expertiseDomain">Domaine d'expertise</Label>
                                <Input {...form.register('expertiseDomain')} placeholder="Ex: Dermo-esthétique" />
                                {form.formState.errors.expertiseDomain && <p className="text-xs text-destructive">{form.formState.errors.expertiseDomain.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phonePro">Téléphone professionnel</Label>
                                <Input {...form.register('phonePro')} placeholder="+41 ..." />
                                {form.formState.errors.phonePro && <p className="text-xs text-destructive">{form.formState.errors.phonePro.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressPro">Adresse de l'établissement</Label>
                            <Input {...form.register('addressPro')} placeholder="Rue, Code Postal, Ville, CH" />
                            {form.formState.errors.addressPro && <p className="text-xs text-destructive">{form.formState.errors.addressPro.message}</p>}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-accent text-white h-12 text-lg">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Envoyer ma demande de vérification"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
