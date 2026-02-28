'use client'

import React from 'react'
import { Link } from '@/navigation'
import { CmsImage } from './CmsImage'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface CmsImageWithOverlayProps {
    src: string | null | undefined
    alt: string
    className?: string
    imageClassName?: string
    fallbackText?: string
    overlayTitle?: string | null
    overlaySubtitle?: string | null
    overlayCtaText?: string | null
    overlayCtaLink?: string | null
    overlayPosition?: 'center' | 'bottom-left' | 'bottom-center' | 'top-left' | 'top-right' | string
    overlayDark?: boolean | string
    priority?: boolean
    sizes?: string
}

export function CmsImageWithOverlay({
    src,
    alt,
    className = '',
    imageClassName = '',
    fallbackText,
    overlayTitle,
    overlaySubtitle,
    overlayCtaText,
    overlayCtaLink,
    overlayPosition = 'bottom-left',
    overlayDark = false,
    priority = false,
    sizes = '100vw'
}: CmsImageWithOverlayProps) {
    const hasOverlay = overlayTitle || overlaySubtitle || overlayCtaText
    const isDark = overlayDark === true || overlayDark === '1' || overlayDark === 'true'

    const positionClasses: Record<string, string> = {
        'center': 'items-center justify-center text-center',
        'bottom-left': 'items-start justify-end text-left',
        'bottom-center': 'items-center justify-end text-center',
        'top-left': 'items-start justify-start text-left',
        'top-right': 'items-end justify-start text-right',
    }

    const gradientClasses: Record<string, string> = {
        'center': 'bg-black/20',
        'bottom-left': 'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
        'bottom-center': 'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
        'top-left': 'bg-gradient-to-b from-black/60 via-black/20 to-transparent',
        'top-right': 'bg-gradient-to-b from-black/60 via-black/20 to-transparent',
    }

    const posClass = positionClasses[overlayPosition as string] || positionClasses['bottom-left']
    const gradClass = gradientClasses[overlayPosition as string] || gradientClasses['center']
    const finalGrad = isDark ? gradClass.replace('/60', '/80').replace('/20', '/40') : gradClass

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            <CmsImage
                src={src}
                alt={alt}
                fill
                className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imageClassName}`}
                fallbackText={fallbackText}
                priority={priority}
                sizes={sizes}
            />

            {src && hasOverlay && (
                <div className={`absolute inset-0 flex flex-col p-8 z-10 ${finalGrad} ${posClass}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4 max-w-lg"
                    >
                        {overlayTitle && (
                            <h3 className="font-oswald text-2xl md:text-3xl text-white uppercase tracking-tight drop-shadow-lg leading-tight">
                                {overlayTitle}
                            </h3>
                        )}
                        {overlaySubtitle && (
                            <p className="text-white/85 text-sm md:text-base font-light leading-relaxed drop-shadow-md">
                                {overlaySubtitle}
                            </p>
                        )}
                        {overlayCtaText && overlayCtaLink && (
                            <div className="pt-4">
                                <Link href={overlayCtaLink}>
                                    <Button className="bg-[#C0A76A] hover:bg-white hover:text-[#262626] text-white font-oswald text-[10px] uppercase tracking-[2px] h-11 px-8 rounded-lg shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1">
                                        {overlayCtaText}
                                        <ArrowRight size={14} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    )
}
