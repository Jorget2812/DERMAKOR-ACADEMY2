import { getPageContents, type Locale } from '@/domains/admin/cms-actions'

export default async function CGVPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const cms = await getPageContents('cgv', locale as Locale)

    const content = cms.cgv_content || "Les conditions générales de vente seront publiées prochainement."

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-3xl">
                <header className="mb-16 border-b border-[#E8E4DC] pb-8">
                    <h1 className="font-oswald text-4xl md:text-5xl font-bold text-[#C0A76A] uppercase tracking-tight">
                        Conditions Générales de Vente
                    </h1>
                    <p className="font-oswald text-xs uppercase tracking-[3px] text-[#6B6560] mt-4">
                        DermaKor Swiss Sàrl — Dernière mise à jour: Février 2026
                    </p>
                </header>

                <article className="prose prose-stone max-w-none prose-p:text-[#262626] prose-p:leading-relaxed prose-headings:font-oswald prose-headings:uppercase prose-headings:text-[#C0A76A]">
                    <div
                        className="text-[#262626] leading-[1.8] font-sans text-base whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </article>
            </div>
        </div>
    )
}
