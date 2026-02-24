import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { GraduationCap, BookOpen, Award, Zap } from 'lucide-react'

export default function AcademyInfoPage() {
    return (
        <div className="flex flex-col w-full bg-[#FDFCFB]">
            {/* Header Section */}
            <section className="py-24 bg-primary text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                    <div className="gold-gradient w-full h-full blur-3xl" />
                </div>
                <div className="container mx-auto px-6 text-center space-y-8 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif">L'Académie Masterclass</h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                        Formations certifiantes et protocoles exclusifs pour les leaders de l'esthétique.
                    </p>
                </div>
            </section>

            {/* Courses Overview */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-serif text-primary italic">Un Curriculm d'Excellence</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto font-light">
                            Nos formations couvrent l'intégralité des pratiques dermo-esthétiques modernes, alliant théorie fondamentale et pratique avancée.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <AcademyFeature
                            icon={BookOpen}
                            title="20+ Modules"
                            desc="Une bibliothèque complète couvrant les peelings, la mésothérapie et les technologies laser."
                        />
                        <AcademyFeature
                            icon={GraduationCap}
                            title="Certifications"
                            desc="Obtenez des certificats officiels DERMAKOR validant vos nouvelles compétences."
                        />
                        <AcademyFeature
                            icon={Zap}
                            title="Protocoles Live"
                            desc="Apprenez grâce à des démonstrations vidéo haute définition sur modèles réels."
                        />
                        <AcademyFeature
                            icon={Award}
                            title="Support Expert"
                            desc="Un accès direct à nos formateurs pour répondre à vos questions techniques."
                        />
                    </div>
                </div>
            </section>

            {/* Detailed Content */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-border/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-serif text-primary underline decoration-accent/20 underline-offset-8">Comment ça marche ?</h3>
                                <ul className="space-y-4">
                                    <StepItem number="01" title="Inscription Pro" desc="Inscrivez-vous et faites valider votre compte professionnel." />
                                    <StepItem number="02" title="Accès Immédiat" desc="Une fois approuvé, accédez à tous les modules de formation en ligne." />
                                    <StepItem number="03" title="Certification" desc="Passez les quiz et obtenez votre certification pour chaque module fini." />
                                </ul>
                                <div className="pt-6">
                                    <Link href="/pro">
                                        <Button className="gold-gradient rounded-full px-10 h-12 uppercase tracking-widest text-[10px] font-bold border-none">
                                            Commencer maintenant
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden aspect-video shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1516542077369-bc737428ece7?auto=format&fit=crop&q=80&w=1000"
                                    alt="Training Session"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 text-center">
                <div className="container mx-auto px-6 space-y-12">
                    <h2 className="text-4xl font-serif text-primary">Élevez vos standards aujourd'hui</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto font-light italic">
                        "L'éducation m'a permis de tripler ma rentabilité cabinet en seulement 6 mois."
                        <span className="block mt-2 not-italic font-bold text-xs uppercase tracking-widest">— Marie L., Esthéticienne Médicale</span>
                    </p>
                    <Link href="/pro">
                        <Button variant="outline" className="rounded-full px-16 h-16 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-xs font-bold">
                            Devenir Partenaire
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

function AcademyFeature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white border border-border/50 hover:border-accent/40 transition-colors shadow-sm group">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                <Icon size={22} />
            </div>
            <h4 className="font-bold text-primary mb-2 italic">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">{desc}</p>
        </div>
    )
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="text-accent font-serif text-2xl opacity-40">{number}</div>
            <div className="space-y-1">
                <h4 className="font-bold text-primary text-sm uppercase tracking-wider">{title}</h4>
                <p className="text-xs text-muted-foreground font-light">{desc}</p>
            </div>
        </div>
    )
}
