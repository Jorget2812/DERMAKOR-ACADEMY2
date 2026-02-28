import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentDynamicEditor } from '@/domains/admin/components/PageContentDynamicEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function FormationsPageEditor() {
    // We fetch ALL locales to have initial data if needed, or just let the client handle it via tabs
    // For simplicity, we'll render tabs and each tab will fetch its own content or we fetch all here
    const contentFr = await getPageContents('formations', 'fr')
    const contentDe = await getPageContents('formations', 'de')
    const contentIt = await getPageContents('formations', 'it')

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/admin/pages">
                        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-white border border-transparent hover:border-slate-100">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-serif text-primary tracking-tight">Design & Catalogue Academy</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-[0.2em]">Gestion dynamique des modules, cours et dates.</p>
                    </div>
                </div>
                <Link href="/academy-info" target="_blank">
                    <Button variant="outline" className="rounded-full px-8 h-12 border-slate-200 text-slate-600 hover:border-accent hover:text-accent font-bold uppercase tracking-widest text-[10px] gap-2">
                        <ExternalLink size={14} /> Voir le site public
                    </Button>
                </Link>
            </header>

            <Tabs defaultValue="fr" className="w-full">
                <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <TabsList className="bg-slate-50/50 p-1 rounded-xl">
                        <TabsTrigger value="fr" className="rounded-lg px-8 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">FRANÇAIS</TabsTrigger>
                        <TabsTrigger value="de" className="rounded-lg px-8 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">DEUTSCH</TabsTrigger>
                        <TabsTrigger value="it" className="rounded-lg px-8 py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">ITALIANO</TabsTrigger>
                    </TabsList>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pr-4">Mode Édition Dynamique</div>
                </div>

                <TabsContent value="fr" className="mt-0">
                    <PageContentDynamicEditor
                        pageSlug="formations"
                        pageName="Nos Formations"
                        currentContent={contentFr}
                        locale="fr"
                    />
                </TabsContent>
                <TabsContent value="de" className="mt-0">
                    <PageContentDynamicEditor
                        pageSlug="formations"
                        pageName="Nos Formations"
                        currentContent={contentDe}
                        locale="de"
                    />
                </TabsContent>
                <TabsContent value="it" className="mt-0">
                    <PageContentDynamicEditor
                        pageSlug="formations"
                        pageName="Nos Formations"
                        currentContent={contentIt}
                        locale="it"
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
