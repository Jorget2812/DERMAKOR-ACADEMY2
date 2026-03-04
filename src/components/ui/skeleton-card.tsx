'use client'

import React from 'react'

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-white rounded-2xl border border-[#E8E4DC] p-5 space-y-4 ${className}`}>
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    )
}

export function SkeletonProductCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden ${className}`}>
            <Skeleton className="h-48 md:h-64 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    )
}

export function SkeletonFormationCard({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden ${className}`}>
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export function SkeletonHero() {
    return (
        <div className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden bg-[#F5F0EB]">
            <div className="container mx-auto px-5 md:px-12 max-w-7xl">
                <div className="max-w-[620px] space-y-5">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-10 md:h-16 w-4/5" />
                    <Skeleton className="h-10 md:h-16 w-3/5" />
                    <Skeleton className="h-px w-20 bg-[#C0A76A]" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-12 w-48 rounded-none" />
                </div>
            </div>
        </div>
    )
}
