import { z } from 'zod'

export const VerificationRequestSchema = z.object({
    fullName: z.string().min(3, "Nom complet requis"),
    email: z.string().email("Email invalide"),
    phonePersonal: z.string().optional(),
    companyName: z.string().min(2, "Raison sociale requise"),
    ideSituation: z.string().min(1, "Situation IDE requise"),
    phonePro: z.string().min(5, "Téléphone professionnel requis"),
    expertiseDomain: z.string().min(1, "Domaine d'expertise requis"),
    website: z.string().url().optional().or(z.literal('')),
    addressPro: z.string().min(5, "Adresse de l'établissement requise"),
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
