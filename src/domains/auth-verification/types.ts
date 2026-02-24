import { z } from 'zod'

export const VerificationRequestSchema = z.object({
    fullName: z.string().min(3, "Nom complet requis"),
    email: z.string().email("Email invalide"),
    phonePersonal: z.string().optional(),
    companyName: z.string().min(2, "Raison sociale requise"),
    ideSituation: z.string().optional(),
    phonePro: z.string().min(5, "Telephone professionnel requis"),
    expertiseDomain: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    addressPro: z.string().optional(),
    canton: z.string().min(1, "Canton / Region requis"),
    professionalType: z.string().min(1, "Type de professionnel requis"),
    requestObject: z.string().min(1, "Objet de la demande requis"),
    message: z.string().optional(),
})

export type VerificationRequestForm = z.infer<typeof VerificationRequestSchema>

export const LoginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe requis"),
})

export const InviteSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})