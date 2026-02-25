'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
    rating: number          // 0 to 5, supports decimals
    count?: number          // number of reviews
    size?: 'sm' | 'md' | 'lg'
    showCount?: boolean     // show review count
    interactive?: boolean   // true in admin
    onRatingChange?: (rating: number) => void
}

export function StarRating({
    rating,
    count,
    size = 'md',
    showCount = true,
    interactive = false,
    onRatingChange
}: StarRatingProps) {
    const starSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16
    const strokeWidth = 1.5

    const handleRatingClick = (newRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(newRating)
        }
    }

    const renderStar = (index: number) => {
        const fillValue = Math.max(0, Math.min(1, rating - index))
        const id = `star-gradient-${index}-${Math.random().toString(36).substr(2, 9)}`

        return (
            <div
                key={index}
                className={cn(
                    "relative flex items-center justify-center",
                    interactive && "cursor-pointer group transition-transform hover:scale-110 active:scale-95"
                )}
                onClick={() => handleRatingClick(index + 1)}
            >
                <svg
                    width={starSize}
                    height={starSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="select-none"
                >
                    <defs>
                        <linearGradient id={id}>
                            <stop offset={`${fillValue * 100}%`} stopColor="#C0A76A" />
                            <stop offset={`${fillValue * 100}%`} stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        stroke={fillValue > 0 ? "#C0A76A" : "#D4D0C8"}
                        strokeWidth={strokeWidth}
                        fill={fillValue > 0 ? `url(#${id})` : "transparent"}
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Admin-only half-star hit areas */}
                {interactive && (
                    <>
                        <div
                            className="absolute inset-y-0 left-0 w-1/2 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRatingClick(index + 0.5);
                            }}
                        />
                        <div
                            className="absolute inset-y-0 right-0 w-1/2 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRatingClick(index + 1);
                            }}
                        />
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-[2px]">
                {[0, 1, 2, 3, 4].map((i) => renderStar(i))}
            </div>
            {showCount && count !== undefined && count > 0 && (
                <span className="text-[12px] font-sans text-[#8A8578] tracking-tight">
                    ({count})
                </span>
            )}
        </div>
    )
}
