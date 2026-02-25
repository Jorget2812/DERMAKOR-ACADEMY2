import { z } from 'zod'

export const VerificationRequestSchema = z.object({
    fullName: z.string().min(3, "Ce champ est requis"),
    email: z.string().email("Adresse email invalide"),
    phonePro: z.string().min(5, "Ce champ est requis").refine(
        (val) => val.startsWith('+41') || val.startsWith('0'),
        "Le numéro doit commencer par +41 ou 0"
    ),
    companyName: z.string().min(2, "Ce champ est requis"),
    professionalType: z.string().min(1, "Ce champ est requis"),
    ideSituation: z.string().min(1, "Ce champ est requis"),
    ideNumber: z.string().optional(),
    addressPro: z.string().min(1, "Ce champ est requis"),
    canton: z.string().min(1, "Ce champ est requis"),
    website: z.string().url("URL invalide").optional().or(z.literal('')),
    requestObject: z.string().min(1, "Ce champ est requis"),
    message: z.string().optional(),
})

export type VerificationRequestForm = z.infer<typeof VerificationRequestSchema>

export const LoginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe requis"),
})

export const InviteSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})