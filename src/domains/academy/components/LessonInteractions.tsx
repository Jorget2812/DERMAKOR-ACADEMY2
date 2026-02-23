'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Loader2 } from 'lucide-react'
import { updateProgress, getResourceUrl } from '@/domains/academy/actions'
import { toast } from 'sonner'

interface LessonInteractionsProps {
    lessonId: string
    pdfPath?: string | null
    initialCompleted?: boolean
}

export function LessonInteractions({ lessonId, pdfPath, initialCompleted = false }: LessonInteractionsProps) {
    const [completed, setCompleted] = useState(initialCompleted)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    async function handleToggleCompletion() {
        setLoading(true)
        try {
            await updateProgress(lessonId, !completed)
            setCompleted(!completed)
            toast.success(completed ? "Marqué como no terminado" : "Leçon terminée !")
        } catch (e: any) {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
    }

    async function handleDownload() {
        if (!pdfPath) return
        setDownloading(true)
        try {
            const url = await getResourceUrl(pdfPath)
            window.open(url, '_blank')
        } catch (e: any) {
            toast.error(e.message || "Erreur de téléchargement")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Resources */}
            <div className="p-6 rounded-2xl border border-border/50 bg-white shadow-sm space-y-4">
                <h3 className="text-lg font-serif flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" /> Ressources
                </h3>
                {pdfPath ? (
                    <Button
                        variant="outline"
                        className="w-full justify-between group h-12 border-accent/20 hover:bg-accent/5"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        <span className="flex items-center gap-2">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />}
                            Protocole PDF
                        </span>
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-none">PDF</Badge>
                    </Button>
                ) : (
                    <p className="text-xs text-muted-foreground text-center">Aucune ressource PDF pour cette leçon.</p>
                )}
            </div>

            {/* Completion */}
            <Button
                className={`w-full h-14 text-lg shadow-lg transition-all duration-300 ${completed
                        ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/10"
                    }`}
                onClick={handleToggleCompletion}
                disabled={loading}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                {completed ? "Terminé" : "Marquer comme terminé"}
            </Button>
        </div>
    )
}
