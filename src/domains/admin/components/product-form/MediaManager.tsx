'use client'

import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from 'react'

interface MediaManagerProps {
    images: string[]
    onChange: (images: string[]) => void
}

export function MediaManager({ images, onChange }: MediaManagerProps) {
    const [newImageUrl, setNewImageUrl] = useState('')

    const addImage = () => {
        if (!newImageUrl) return
        onChange([...images, newImageUrl])
        setNewImageUrl('')
    }

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index))
    }

    return (
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Media</h3>
                <span className="text-[9px] text-primary/20">{images.length} / 10 images</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {/* Main Image */}
                <div className="col-span-2 row-span-2 aspect-square relative rounded-2xl overflow-hidden bg-[#F9F7F5] border border-[#F6F6F6] group">
                    {images[0] ? (
                        <img src={images[0]} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-primary/5" />
                        </div>
                    )}
                    {images[0] && (
                        <Badge className="absolute top-3 left-3 bg-white/90 text-[8px] font-bold uppercase text-primary/60 px-2 h-5 border-none shadow-sm">Main</Badge>
                    )}
                </div>

                {/* Sub-images */}
                {images.slice(1, 3).map((url, idx) => (
                    <div key={idx} className="aspect-square relative rounded-xl overflow-hidden bg-[#F9F7F5] border border-[#F6F6F6] group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeImage(idx + 1)}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive shadow-sm"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                ))}

                {/* Add Placeholder */}
                <div className="aspect-square rounded-xl border border-dashed border-[#EEEEEE] flex items-center justify-center bg-[#FDFCFB] hover:bg-[#F9F7F5] cursor-pointer transition-colors group">
                    <Plus size={16} className="text-primary/20 group-hover:text-accent group-hover:scale-110 transition-all" />
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="URL..."
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="h-9 rounded-xl bg-[#FDFCFB] border-[#EEEEEE] text-[11px] px-4 placeholder:text-primary/20"
                />
                <Button
                    type="button"
                    onClick={addImage}
                    className="rounded-xl h-9 px-4 bg-[#1A1A1A] text-white text-[10px] font-bold"
                >
                    Add
                </Button>
            </div>
        </div>
    )
}
