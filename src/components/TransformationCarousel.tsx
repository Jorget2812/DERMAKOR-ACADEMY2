'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Slide {
    image: string
    title: string
    desc: string
}

interface TransformationCarouselProps {
    slides: Slide[]
    badgeText: string
}

export function TransformationCarousel({ slides, badgeText }: TransformationCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Handle responsiveness
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const next = useCallback(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    const prev = useCallback(() => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])

    // Auto-play
    useEffect(() => {
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [next])

    const getSlideIndex = (offset: number) => {
        return (currentIndex + offset + slides.length) % slides.length
    }

    const renderCard = (offset: number) => {
        const index = getSlideIndex(offset)
        const slide = slides[index]

        // Mobile only shows 1 card (center)
        if (isMobile && offset !== 0) return null

        const isCenter = offset === 0

        return (
            <motion.div
                key={`${index}-${offset}`}
                className={`relative flex-shrink-0 transition-all duration-500 overflow-hidden rounded-xl bg-white shadow-xl
                    ${isCenter ? 'z-20 w-[300px] md:w-[400px] h-[400px] md:h-[500px]' : 'z-10 w-[240px] md:w-[320px] h-[320px] md:h-[400px] opacity-70 scale-95'}`}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: isCenter ? 1 : 0.7, scale: isCenter ? 1.05 : 0.95 }}
                exit={{ x: -direction * 50, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {/* Image */}
                <div className="relative w-full h-[70%] overflow-hidden">
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                    />
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-[#C0A76A]/20">
                            <Star size={10} className="text-[#C0A76A] fill-[#C0A76A]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C0A76A]">
                                {badgeText}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between h-[30%]">
                    <div className="space-y-1">
                        <h3 className="font-oswald text-lg font-bold text-[#262626] uppercase leading-tight">
                            {slide.title}
                        </h3>
                        <p className="text-xs text-[#6B6560] line-clamp-2 md:line-clamp-none italic">
                            {slide.desc}
                        </p>
                    </div>

                    <div className="pt-2">
                        <button className="text-[10px] font-bold uppercase tracking-[2px] text-[#C0A76A] hover:text-[#262626] transition-colors flex items-center gap-2 group">
                            Voir le traitement
                            <div className="w-4 h-px bg-[#C0A76A] group-hover:bg-[#262626] transition-colors" />
                        </button>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 py-20 overflow-hidden">
            <div className="flex items-center justify-center gap-4 md:gap-8 min-h-[550px]">
                {/* Previous Button */}
                <button
                    onClick={prev}
                    className="absolute left-4 md:left-10 z-30 w-12 h-12 rounded-full bg-white border border-[#E8E4DC] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
                >
                    <ChevronLeft size={20} className="text-[#6B6560] group-hover:text-[#C0A76A]" />
                </button>

                {/* Cards Container */}
                <div className="flex items-center justify-center gap-6 md:gap-12 w-full overflow-visible">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {!isMobile && renderCard(-1)}
                        {renderCard(0)}
                        {!isMobile && renderCard(1)}
                    </AnimatePresence>
                </div>

                {/* Next Button */}
                <button
                    onClick={next}
                    className="absolute right-4 md:right-10 z-30 w-12 h-12 rounded-full bg-white border border-[#E8E4DC] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
                >
                    <ChevronRight size={20} className="text-[#6B6560] group-hover:text-[#C0A76A]" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-12">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setDirection(i > currentIndex ? 1 : -1)
                            setCurrentIndex(i)
                        }}
                        className={`transition-all duration-300 rounded-full h-1.5 
                            ${i === currentIndex ? 'bg-[#C0A76A] w-6' : 'bg-[#E8E4DC] w-1.5'}`}
                    />
                ))}
            </div>
        </div>
    )
}
