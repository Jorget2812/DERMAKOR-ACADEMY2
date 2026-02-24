import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { ArrowRight, Star, ShieldCheck, GraduationCap, ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LandingPage() {
    const t = useTranslations('Index');
    const common = useTranslations('Common');

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero-bg.png"
                        alt="Expertise Dermo-Esthétique"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-accent/10 z-20" />
                </div>

                <div className="container relative z-20 px-6 text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex justify-center">
                        <span className="px-6 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.3em] font-bold backdrop-blur-sm">
                            {t('hero.badge')}
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-primary leading-[1] max-w-5xl mx-auto">
                        {t.rich('hero.title', {
                            accent: (chunks) => <span className="text-accent italic font-light">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                        {t('hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                        <Link href="/pro">
                            <Button size="lg" className="h-16 px-12 rounded-full gold-gradient text-white shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-500 font-bold uppercase tracking-[0.2em] text-[10px] border-none">
                                {common('nav.register')}
                            </Button>
                        </Link>
                        <Link href="/shop">
                            <Button size="lg" variant="outline" className="h-16 px-12 rounded-full border-primary/10 hover:border-accent hover:text-accent font-bold uppercase tracking-[0.2em] text-[10px] transition-all bg-white/50 backdrop-blur-sm">
                                {t('hero.cta_secondary')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust & Features */}
            <section className="py-32 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                <div className="container px-6 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                        <FeatureCard
                            icon={Star}
                            title={t('features.swiss.title')}
                            description={t('features.swiss.desc')}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title={t('features.restricted.title')}
                            description={t('features.restricted.desc')}
                        />
                        <FeatureCard
                            icon={GraduationCap}
                            title={t('features.academy.title')}
                            description={t('features.academy.desc')}
                        />
                    </div>
                </div>
            </section>
            ...
            {/* Dual Experience Section */}
            <section className="py-32">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
                                Une double plateforme pour votre <span className="text-accent underline decoration-accent/20 underline-offset-8">croissance</span>
                            </h2>
                            <div className="space-y-6">
                                <IconBox
                                    icon={ShoppingBag}
                                    title="La Boutique Pro"
                                    description="Commandez vos produits cabine et revente avec des remises échelonnées jusqu'à 50% selon votre statut."
                                />
                                <IconBox
                                    icon={GraduationCap}
                                    title="L'Académie LMS"
                                    description="Plus de 20 modules de formation vidéo, supports PDF et quiz pour certifier vos compétences."
                                />
                            </div>
                            <Button variant="link" className="text-accent p-0 font-bold uppercase tracking-widest text-xs group">
                                En savoir plus sur nos programmes <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl gold-glow border-8 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000"
                                alt="Clinic Interior"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                            <div className="absolute bottom-10 left-10 text-white">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-accent text-accent" />)}
                                </div>
                                <p className="font-medium italic">"La référence incontournable en Suisse romande."</p>
                                <p className="text-sm opacity-80 mt-1">— Clinique de la Source, Lausanne</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-40 bg-primary text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="gold-gradient w-full h-full opacity-30 blur-3xl animate-pulse" />
                </div>
                <div className="container relative z-10 px-6 space-y-12">
                    <h2 className="text-5xl font-bold tracking-tight">Rejoignez l'élite dermo-esthétique</h2>
                    <p className="max-w-2xl mx-auto text-white/60 font-light text-lg tracking-wide">
                        Vérification de compte en moins de 24h pour les professionnels suisses éligibles.
                        Accédez aux tarifs professionnels et certifiez vos compétences.
                    </p>
                    <Link href="/pro">
                        <Button size="lg" className="gold-gradient text-white border-none rounded-full px-16 h-16 font-bold uppercase tracking-[0.25em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-accent/40 active:scale-95">
                            Déposer une demande d'accès
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center text-center space-y-4 group">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-serif text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">{description}</p>
        </div>
    )
}

function IconBox({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                <Icon size={20} />
            </div>
            <div className="space-y-1">
                <h4 className="font-bold text-primary">{title}</h4>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
