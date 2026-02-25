import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { ShieldCheck, Star, Users } from 'lucide-react'
import { getPageContents } from '@/domains/admin/cms-actions'

const DEFAULTS = {
    page_title: "L'Excellence à la Source",
    page_subtitle: "DERMAKOR SWISS est le partenaire privilégié des professionnels de la dermo-esthétique en Suisse.",
    mission_title: "Notre Mission",
    mission_text1: "Née d'une volonté de standardiser l'excellence dans les soins esthétiques avancés, notre académie offre bien plus que des produits. Nous fournissons un écosystème complet : des formulations de pointe alliées à une éducation rigoureuse.",
    mission_text2: "Basés en Suisse, nous nous engageons à respecter les standards de qualité les plus élevés, garantissant à nos partenaires des résultats exceptionnels et une sécurité totale.",
    stat1_value: "100%",
    stat1_label: "Expertise Suisse",
    stat2_value: "500+",
    stat2_label: "Partenaires Certifiés",
    value1_title: "Rigueur Scientifique",
    value1_desc: "Toutes nos formations et produits sont validés par des protocoles cliniques stricts.",
    value2_title: "Exclusivité B2B",
    value2_desc: "Nous protégeons nos partenaires en réservant nos produits et tarifs aux seuls experts vérifiés.",
    value3_title: "Communauté d'Experts",
    value3_desc: "Rejoignez un réseau de professionnels passionnés par l'innovation esthétique.",
    cta_title: "Prêt à transformer votre pratique ?",
    cta_button: "Rejoindre l'Académie",
}

export default async function AboutPage() {
    const cms = await getPageContents('about', 'fr')
    const c = (key: string) => cms[key] || DEFAULTS[key as keyof typeof DEFAULTS] || ''

    return (
        <div className="flex flex-col w-full bg-[#FDFCFB]">
            {/* Header Section */}
            <section className="py-24 border-b bg-white">
                <div className="container mx-auto px-6 text-center space-y-8">
                    <h1 className="text-4xl md:text-6xl font-serif text-primary">{c('page_title')}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                        {c('page_subtitle')}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-serif text-primary">{c('mission_title')}</h2>
                            <p className="text-muted-foreground font-light leading-relaxed">{c('mission_text1')}</p>
                            <p className="text-muted-foreground font-light leading-relaxed">{c('mission_text2')}</p>
                            <div className="grid grid-cols-2 gap-8 pt-6">
                                <div className="space-y-2">
                                    <div className="text-accent font-bold text-3xl">{c('stat1_value')}</div>
                                    <div className="text-sm uppercase tracking-widest text-muted-foreground">{c('stat1_label')}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-accent font-bold text-3xl">{c('stat2_value')}</div>
                                    <div className="text-sm uppercase tracking-widest text-muted-foreground">{c('stat2_label')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl gold-glow border-8 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=1000"
                                alt="Laboratory Quality"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <ValueItem icon={ShieldCheck} title={c('value1_title')} description={c('value1_desc')} />
                        <ValueItem icon={Star} title={c('value2_title')} description={c('value2_desc')} />
                        <ValueItem icon={Users} title={c('value3_title')} description={c('value3_desc')} />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 text-center space-y-8">
                <h2 className="text-3xl font-serif text-primary">{c('cta_title')}</h2>
                <Link href="/pro">
                    <Button size="lg" className="gold-gradient rounded-full px-12 h-14 uppercase tracking-widest text-[10px] font-bold border-none shadow-xl">
                        {c('cta_button')}
                    </Button>
                </Link>
            </section>
        </div>
    )
}

function ValueItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-primary italic">{title}</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">{description}</p>
        </div>
    )
}
