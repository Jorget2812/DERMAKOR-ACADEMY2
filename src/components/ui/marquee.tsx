'use client'

import { type ReactNode } from 'react'

interface MarqueeProps {
    children: ReactNode
    speed?: number
    className?: string
}

export function Marquee({ children, speed = 30, className = '' }: MarqueeProps) {
    return (
        <div className={`overflow-hidden whitespace-nowrap ${className}`}>
            <div
                className="inline-flex animate-marquee"
                style={{ animationDuration: `${speed}s` }}
            >
                <span className="inline-flex items-center gap-4 px-4">{children}</span>
                <span className="inline-flex items-center gap-4 px-4" aria-hidden>{children}</span>
                <span className="inline-flex items-center gap-4 px-4" aria-hidden>{children}</span>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-marquee {
                    animation: marquee linear infinite;
                }
            `}</style>
        </div>
    )
}
