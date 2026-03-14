'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Image as ImageIcon } from 'lucide-react'

export function resolveCmsImage(path: string | null | undefined): string {
    if (!path) return ''
    if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path
    if (path.startsWith('cms/')) {
        const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        return `${projectUrl}/storage/v1/object/public/academy-pdfs/${path}`
    }
    return path
}

interface CmsImageProps extends Omit<ImageProps, 'src'> {
    src: string | null | undefined
    fallbackText?: string
}

export function CmsImage({ src, alt, className, fallbackText, ...props }: CmsImageProps) {
    const [error, setError] = useState(false)
    const resolvedSrc = resolveCmsImage(src)

    const isInvalid = !resolvedSrc || resolvedSrc === '' || resolvedSrc.includes('placeholder') || error

    if (isInvalid) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-[#F5F0EB] border border-dashed border-[#E8E4DC] transition-all ${props.fill ? '' : 'min-h-[120px] sm:min-h-[200px]'} ${className}`}
                style={{ minHeight: props.fill ? '100%' : undefined }}
            >
                <ImageIcon size={48} strokeWidth={1} className="text-[#E8E4DC] mb-2" />
                {fallbackText && (
                    <span className="font-oswald text-[12px] uppercase tracking-widest text-[#E8E4DC]">
                        {fallbackText}
                    </span>
                )}
            </div>
        )
    }

    return (
        <Image
            src={resolvedSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    )
}
