import { getPendingVerifications } from '@/domains/admin/admin-actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, Globe, MapPin, CheckCircle } from 'lucide-react'
import { VerificationButtons } from '@/domains/admin/components/VerificationButtons'

export default async function VerificationsPage() {
    const requests = await getPendingVerifications()

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif text-primary">Demandes de Vérification</h1>
                <p className="text-muted-foreground mt-1 text-sm font-light">Examinez les demandes d'accès des professionnels dermo-esthétiques.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {requests.map((req) => (
                    <Card key={req.id} className="border-none shadow-sm bg-white overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-72 bg-slate-50 p-8 border-r border-slate-100 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                                    <Building2 size={32} />
                                </div>
                                <h3 className="font-bold text-lg leading-tight">{req.company_name}</h3>
                                <Badge variant="outline" className="mt-2 bg-white border-accent/20 text-accent uppercase text-[10px] tracking-widest">{req.expertise_domain}</Badge>
                            </div>

                            <div className="flex-grow p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <CheckCircle size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Contact Principal</span>
                                                <span className="font-medium">{req.full_name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Mail size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                                                <span className="font-medium">{req.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                                <Phone size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Téléphone Pro</span>
                                                <span className="font-medium">{req.phone_pro}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Globe size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Site Web / IDE</span>
                                                <span className="font-medium">{req.website || 'N/A'} • {req.ide_situation}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Adresse</span>
                                                <span className="font-medium line-clamp-1">{req.address_pro}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {req.message && (
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic text-sm text-slate-600">
                                        "{req.message}"
                                    </div>
                                )}

                                <VerificationButtons requestId={req.id} />
                            </div>
                        </div>
                    </Card>
                ))}

                {requests.length === 0 && (
                    <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif">Tout est à jour</h3>
                            <p className="text-sm text-slate-400">Aucune demande de vérification en attente pour le moment.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
