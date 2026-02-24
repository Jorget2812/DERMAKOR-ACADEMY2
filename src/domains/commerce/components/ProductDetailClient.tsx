'use client'

import { useState, useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { PublicProduct, VerifiedProduct } from '../types'
import Image from 'next/image'
import { QuantitySelector } from './QuantitySelector'
import { AddToCartButton } from './AddToCartButton'
import {
    ChevronLeft,
    ShieldCheck,
    Truck,
    ArrowRight,
    ShoppingBag,
    Lock,
    Sparkles,
    CheckCircle2,
    Microscope,
    FlaskConical
} from 'lucide-react'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProductDetailClientProps {
    product: PublicProduct & { images?: string[] }
    initialPricing: VerifiedProduct | null
    isAdmin?: boolean
    badgeText?: string | null
}

export function ProductDetailClient({ product, initialPricing, isAdmin, badgeText }: ProductDetailClientProps) {
    const [qty, setQty] = useState(1)
    const [activeImage, setActiveImage] = useState(0)

    const images = product.images || []
    const hasPricing = !!initialPricing

    const sanitizedDescription = useMemo(() => {
        return DOMPurify.sanitize(product.description || "", {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'li', 'b', 'i']
        });
    }, [product.description]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Nav Superior */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <Link
                    href="/app/shop"
                    className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40 hover:text-accent transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                        <ChevronLeft size={14} />
                    </div>
                    Retour au Catalogue Professionnel
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
                {/* Columna Izquierda: Galería Premium */}
                <div className="space-y-10">
                    <motion.div
                        layoutId={`product-image-${product.id}`}
                        className="aspect-[4/5] relative bg-[#F9F7F5] rounded-[48px] overflow-hidden shadow-2xl shadow-primary/5 group border border-secondary/50"
                    >
                        {images[activeImage] ? (
                            <Image
                                src={images[activeImage]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-primary/5">
                                <ShoppingBag size={140} strokeWidth={0.5} />
                            </div>
                        )}

                        {hasPricing && initialPricing.discount_percent > 0 && (
                            <div className="absolute top-10 left-10 bg-accent text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-xl backdrop-blur-md">
                                EXCLUSIF PRO: -{initialPricing.discount_percent}%
                            </div>
                        )}

                        <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-accent shadow-lg border border-white">
                            <Microscope size={24} />
                        </div>
                    </motion.div>

                    {/* Thumbnails con scroll suave */}
                    {images.length > 1 && (
                        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 px-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={cn(
                                        "relative w-28 aspect-square rounded-[24px] overflow-hidden border-2 transition-all shrink-0",
                                        activeImage === idx ? "border-accent shadow-xl scale-110 z-10" : "border-transparent opacity-50 hover:opacity-100"
                                    )}
                                >
                                    <Image src={img} alt={product.name} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Información y Compra */}
                <div className="lg:sticky lg:top-12 h-fit space-y-16">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <Badge content={hasPricing ? initialPricing.sku : 'PRO CATALOG'} />
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-7xl font-serif tracking-tight text-primary leading-[1.1]"
                            >
                                {product.name}
                            </motion.h1>
                        </div>

                        {/* Precio o Lock */}
                        {hasPricing ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-6"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Prix Pro Net</span>
                                    <span className="text-5xl font-bold tracking-tighter text-primary">
                                        {(initialPricing.gross_price_cents / 100).toFixed(2)}
                                        <span className="text-sm font-medium ml-2 text-primary/40 uppercase tracking-tighter italic">CHF</span>
                                    </span>
                                </div>
                                {initialPricing.discount_percent > 0 && (
                                    <div className="flex flex-col border-l border-secondary pl-6">
                                        <span className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mb-1">Prix Public</span>
                                        <span className="text-2xl text-primary/20 line-through decoration-1 tracking-tighter">
                                            {(initialPricing.base_price_cents / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="bg-secondary/20 p-8 rounded-[32px] border border-secondary/50 flex items-center gap-6 group hover:border-accent/30 transition-all">
                                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 shadow-inner">
                                    <Lock size={22} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">Tarification Réservée</p>
                                    <p className="text-[10px] text-primary/40 uppercase tracking-tight mt-1 leading-relaxed">Veuillez vous connecter pour accéder aux tarifs professionnels et à la commande.</p>
                                </div>
                            </div>
                        )}

                        <div
                            className="text-primary/60 text-xl leading-relaxed font-medium tracking-tight border-l-2 border-accent/20 pl-8 italic prose prose-slate"
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription || "Une solution professionnelle dermatologique conçue pour des résultats exceptionnels et une précision clinique de haut niveau." }}
                        />
                    </div>

                    {/* Acciones de Compra */}
                    {hasPricing ? (
                        <div className="space-y-10 pt-10 border-t border-secondary">
                            <div className="flex flex-wrap items-end gap-10">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40">Unités</span>
                                    <QuantitySelector
                                        value={qty}
                                        onChange={setQty}
                                        max={initialPricing.stock_count}
                                    />
                                </div>

                                <div className="flex-grow">
                                    <AddToCartButton
                                        variantId={initialPricing.variant_id}
                                        name={initialPricing.name}
                                        sku={initialPricing.sku}
                                        price={initialPricing.gross_price_cents}
                                        image={images[0] || null}
                                        qty={qty}
                                        disabled={initialPricing.stock_count === 0}
                                    />
                                </div>
                            </div>

                            {isAdmin && (<div className="flex items-center gap-4 py-4 px-6 bg-secondary/30 rounded-2xl w-fit">
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full animate-pulse",
                                    initialPricing.stock_count > 10 ? "bg-emerald-500" : initialPricing.stock_count > 0 ? "bg-amber-500" : "bg-primary/20"
                                )} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/60">
                                    {initialPricing.stock_count > 10
                                        ? 'Stock Disponible (24h)'
                                        : initialPricing.stock_count > 0
                                            ? (isAdmin ? `Stock Critique: ${initialPricing.stock_count} restants` : 'Stock Faible')
                                            : 'Rupture de Stock'
                                    }
                                </span>
                            </div>)}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center justify-between w-full h-20 px-10 bg-primary text-white rounded-[32px] hover:bg-accent transition-all group shadow-2xl shadow-primary/20 hover:scale-[1.02] transform duration-500"
                        >
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Accès Boutique Pro</span>
                            <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    )}

                    {/* Nueva Sección: Beneficios Clínicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-secondary">
                        <BenefitItem
                            icon={Sparkles}
                            title="Régénération Cellulaire"
                            desc="Accélère le processus de cicatrisation cutanée post-traitement."
                        />
                        <BenefitItem
                            icon={CheckCircle2}
                            title="Pureté Clinique"
                            desc="Formulation stérile sans parabènes ni parfums synthétiques."
                        />
                        <BenefitItem
                            icon={FlaskConical}
                            title="Bio-Actifs Haute-Dose"
                            desc="Concentré en Centella Asiatica et peptides réparateurs."
                        />
                        <BenefitItem
                            icon={ShieldCheck}
                            title="Barrière Lipidique"
                            desc="Renforce durablement les défenses naturelles de la peau."
                        />
                    </div>

                    {/* Acordeones de Información Técnica */}
                    <div className="pt-12 space-y-4">
                        <Accordion title="Protocole D'Application">
                            <p className="leading-loose">
                                Une application précise est clé pour les résultats cliniques. Appliquer sur une peau parfaitement nettoyée matin et soir. Massez délicatement avec des mouvements ascendants jusqu’à absorption complète. Pour les traitements post-peeling, appliquer toutes les 4 heures pendant les premières 48h.
                            </p>
                        </Accordion>
                        <Accordion title="Composition & Sécurité">
                            <p className="leading-loose">
                                Testé sous contrôle dermatologique en conditions cliniques. Non-comédogène. Hypoallergénique. Adapté aux peaux les plus sensibles et réactives après des procédures invasives.
                            </p>
                        </Accordion>
                        {hasPricing && (
                            <Accordion title="Spécifications Logistiques B2B">
                                <div className="space-y-3">
                                    <p className="flex justify-between border-b border-secondary/50 pb-2">
                                        <span className="text-primary/40 uppercase text-[9px] font-bold tracking-widest">Type de TVA</span>
                                        <span className="font-bold text-[10px]">{initialPricing.vat_rate > 0 ? 'Standard (8.1%)' : 'Exonéré (PRO)'}</span>
                                    </p>
                                    <p className="flex justify-between border-b border-secondary/50 pb-2">
                                        <span className="text-primary/40 uppercase text-[9px] font-bold tracking-widest">Origine</span>
                                        <span className="font-bold text-[10px]">KRX Aesthetics / Séoul</span>
                                    </p>
                                    <p className="flex justify-between pb-2">
                                        <span className="text-primary/40 uppercase text-[9px] font-bold tracking-widest">Unité Expédition</span>
                                        <span className="font-bold text-[10px]">Indiv / Carton de 12</span>
                                    </p>
                                </div>
                            </Accordion>
                        )}
                    </div>

                    {/* Señales de Confianza */}
                    <div className="flex items-center gap-12 pt-12">
                        <div className="flex items-center gap-3">
                            <Truck size={18} className="text-accent" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40">Livraison Express CH</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className="text-accent" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40">Qualité Médicale Certifiée</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Badge({ content }: { content: string }) {
    return (
        <div className="inline-flex items-center px-4 py-1.5 bg-accent/5 rounded-full border border-accent/20">
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.25em]">{content}</span>
        </div>
    )
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="space-y-3 p-6 rounded-3xl bg-secondary/20 border border-transparent hover:border-accent/10 hover:bg-white transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm">
                <Icon size={20} />
            </div>
            <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</h4>
                <p className="text-[10px] text-primary/40 leading-relaxed uppercase tracking-tight">{desc}</p>
            </div>
        </div>
    )
}

function Accordion({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <details className="group border-b border-secondary pb-6">
            <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary group-hover:text-accent transition-colors">{title}</span>
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-primary/20 group-hover:bg-accent/10 group-hover:text-accent transition-all group-open:rotate-90">
                    <ArrowRight size={14} />
                </div>
            </summary>
            <div className="mt-6 text-[12px] text-primary/50 leading-loose uppercase tracking-wide px-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                {children}
            </div>
        </details>
    )
}
