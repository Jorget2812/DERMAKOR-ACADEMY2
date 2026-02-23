'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { importProductsCSV } from '@/domains/admin/product-actions'
import { toast } from 'sonner'

export default function ImportCSVPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<any>(null)

    async function handleUpload() {
        if (!file) return
        setLoading(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await importProductsCSV(formData)
            setReport(res)
            toast.success("Importation Shopify terminée")
        } catch (err: any) {
            toast.error("Erreur lors de l'import : " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Upload size={20} />
                    </div>
                    <h1 className="text-3xl font-serif">Importation Shopify</h1>
                </div>
                <p className="text-slate-500">Mettez à jour votre catalogue complet en utilisant le format standard de Shopify.</p>
            </header>

            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Colonnes Supportées</CardTitle>
                    <CardDescription className="text-[11px] leading-relaxed font-mono bg-white p-4 rounded-lg border border-slate-100 mt-2">
                        Handle, Title, Body (HTML), Vendor, Product Category, Type, Tags, Published, Option1 Name, Option1 Value, Option2 Name, Option2 Value, Variant SKU, Variant Inventory Qty, Variant Price, Variant Compare At Price, Image Src, etc.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="bg-white h-14 pt-4 border-slate-200 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="h-12 px-8 bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg shadow-accent/20 flex-grow"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Lancer l'importation massive
                        </Button>
                        <Button variant="outline" asChild className="h-12 px-6 border-slate-200 text-slate-500 rounded-xl bg-white">
                            <a href="/templates/import_template_shopify.csv" download>
                                <FileText className="mr-2 h-4 w-4" /> Modèle Prof.
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {report && (
                <Card className="border-none shadow-xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="h-1 bg-accent" />
                    <CardHeader>
                        <CardTitle className="font-serif">Rapport d'exécution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100/50 text-center">
                                <span className="block text-3xl font-bold text-green-700">{report.created}</span>
                                <span className="text-[10px] uppercase font-bold text-green-600 tracking-widest">Nouveaux</span>
                            </div>
                            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                                <span className="block text-3xl font-bold text-blue-700">{report.updated}</span>
                                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">Mis à jour</span>
                            </div>
                            <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/50 text-center">
                                <span className="block text-3xl font-bold text-red-700">{report.errors}</span>
                                <span className="text-[10px] uppercase font-bold text-red-600 tracking-widest">Erreurs</span>
                            </div>
                        </div>

                        {report.details.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" /> Détails logiques
                                </h4>
                                <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-2">
                                    {report.details.map((d: any, i: number) => (
                                        <div key={i} className="text-[11px] text-red-600 font-mono bg-white p-2 rounded border border-red-50 flex justify-between">
                                            <span>Handle: {d.handle || 'N/A'}</span>
                                            <span className="font-bold">{d.error}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
