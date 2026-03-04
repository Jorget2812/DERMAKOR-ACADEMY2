import { SkeletonHero, Skeleton, SkeletonCard } from '@/components/ui/skeleton-card'

export default function PublicLoading() {
    return (
        <div className="flex flex-col w-full overflow-x-hidden animate-in fade-in duration-300">
            {/* Hero Skeleton */}
            <SkeletonHero />

            {/* Trust Bar Skeleton */}
            <div className="bg-[#F5F0EB] h-[56px] border-b border-[#E8E4DC] flex items-center justify-center">
                <Skeleton className="h-3 w-96" />
            </div>

            {/* Brand Statement Skeleton */}
            <div className="bg-[#FAFAF8] py-12 md:py-28">
                <div className="container mx-auto px-5 md:px-12 max-w-6xl">
                    <div className="space-y-4">
                        <Skeleton className="h-8 md:h-12 w-full" />
                        <Skeleton className="h-8 md:h-12 w-4/5" />
                    </div>
                </div>
            </div>

            {/* Cards Grid Skeleton */}
            <div className="bg-white py-12 md:py-24">
                <div className="container mx-auto px-5 md:px-12 max-w-7xl">
                    <Skeleton className="h-3 w-32 mb-3" />
                    <Skeleton className="h-8 w-64 mb-10" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SkeletonCard />
                        <SkeletonCard className="hidden md:block" />
                        <SkeletonCard className="hidden md:block" />
                    </div>
                </div>
            </div>
        </div>
    )
}
