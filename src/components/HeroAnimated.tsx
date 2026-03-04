'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/navigation'
import { ArrowRight, ArrowDown } from 'lucide-react'

interface HeroAnimatedProps {
    overtitle: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    ctaLabel: string
    ctaLink: string
}

export function HeroAnimated({ overtitle, titleLine1, titleLine2, subtitle, ctaLabel, ctaLink }: HeroAnimatedProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(t)
    }, [])

    const base = "transition-all duration-1000"
    const visible = "opacity-100 translate-y-0"
    const hidden = "opacity-0 translate-y-6"

    return (
        <div className="container relative z-20 px-5 md:px-12 max-w-7xl mx-auto">
            <div className="max-w-[620px] space-y-5 md:space-y-8">

                {/* Overtitle */}
                <div
                    className={`${base} ${mounted ? visible : hidden}`}
                    style={{ transitionDelay: '0ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                >
                    <span className="font-oswald text-[10px] uppercase tracking-[4px] text-[#C0A76A]">
                        {overtitle}
                    </span>
                </div>

                {/* Title Line 1 */}
                <div
                    className={`${base} ${mounted ? visible : hidden} overflow-hidden`}
                    style={{ transitionDelay: '150ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                >
                    <h1 className="font-oswald leading-[1.05]">
                        <span className="block text-3xl md:text-5xl lg:text-7xl xl:text-[88px] font-light text-[#262626] tracking-tight">
                            {titleLine1}
                        </span>
                    </h1>
                </div>

                {/* Title Line 2 */}
                <div
                    className={`${base} ${mounted ? visible : hidden}`}
                    style={{ transitionDelay: '280ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)', marginTop: 0 }}
                >
                    <span className="block font-oswald text-3xl md:text-5xl lg:text-7xl xl:text-[88px] font-bold italic text-[#C0A76A] tracking-tight leading-[1.05]">
                        {titleLine2}
                    </span>
                </div>

                {/* Gold rule */}
                <div
                    className={`${base} ${mounted ? 'opacity-100 w-20' : 'opacity-0 w-0'} h-px bg-[#C0A76A] overflow-hidden`}
                    style={{ transitionDelay: '420ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                />

                {/* Subtitle */}
                <div
                    className={`${base} ${mounted ? visible : hidden}`}
                    style={{ transitionDelay: '520ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                >
                    <p className="font-oswald text-xs uppercase tracking-[4px] text-[#6B6560]">
                        {subtitle}
                    </p>
                </div>

                {/* CTA */}
                <div
                    className={`${base} ${mounted ? visible : hidden} pt-2`}
                    style={{ transitionDelay: '650ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                >
                    <Link
                        href={ctaLink}
                        className="inline-flex items-center justify-center gap-3 px-8 py-3.5 min-h-[52px] border border-[#262626] text-[#262626] font-oswald text-xs uppercase tracking-[2px] hover:bg-[#262626] hover:text-white transition-all duration-300 group tap-scale"
                    >
                        {ctaLabel}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Scroll indicator */}
            <div
                className={`absolute bottom-[-120px] left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 ${base} ${mounted ? visible : hidden}`}
                style={{ transitionDelay: '900ms' }}
            >
                <div className="w-px h-12 bg-[#C0A76A] animate-pulse" />
                <ArrowDown size={12} className="text-[#C0A76A]" />
            </div>
        </div>
    )
}