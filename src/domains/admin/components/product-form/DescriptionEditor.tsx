'use client'

import { useState } from 'react'
import { UseFormRegister, UseFormWatch } from 'react-hook-form'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Code, List, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DescriptionEditorProps {
    register: UseFormRegister<any>
    watch: UseFormWatch<any>
}

export function DescriptionEditor({ register, watch }: DescriptionEditorProps) {
    const [isHtmlMode, setIsHtmlMode] = useState(true) // Default to HTML for professional precision
    const descriptionValue = watch('description')

    return (
        <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden flex flex-col h-[500px] shadow-sm">
            <div className="px-6 h-14 flex items-center justify-between border-b border-[#F6F6F6] shrink-0 bg-white">
                <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Description</Label>
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        isHtmlMode ? "bg-[#C5A267]" : "bg-emerald-500"
                    )} />
                </div>
                <button
                    type="button"
                    onClick={() => setIsHtmlMode(!isHtmlMode)}
                    className="h-8 px-3 rounded-lg border border-[#EEEEEE] text-[9px] font-bold uppercase tracking-widest text-[#C5A267] flex items-center gap-1.5 hover:bg-[#FDFCFB] transition-all"
                >
                    {isHtmlMode ? (
                        <><Eye size={12} /> View Visual</>
                    ) : (
                        <><Code size={12} /> Edit HTML</>
                    )}
                </button>
            </div>

            {!isHtmlMode && (
                <div className="bg-[#FDFCFB]/50 border-b border-[#F6F6F6] px-4 h-11 flex items-center gap-0.5 shrink-0">
                    <span className="text-[10px] text-primary/30 font-medium px-2 uppercase tracking-tight italic">Visual Preview Mode</span>
                    <div className="flex-grow" />
                    <button type="button" className="w-8 h-8 flex items-center justify-center font-bold text-primary/40 hover:bg-secondary/50 rounded-lg text-xs">B</button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center italic text-primary/40 hover:bg-secondary/50 rounded-lg text-xs">I</button>
                    <div className="w-px h-4 bg-[#F6F6F6] mx-1" />
                    <button type="button" className="w-8 h-8 flex items-center justify-center text-primary/40 hover:bg-secondary/50 rounded-lg"><List size={14} /></button>
                </div>
            )}

            <div className="flex-grow overflow-hidden relative bg-[#FDFCFB]/30">
                {isHtmlMode ? (
                    <Textarea
                        {...register('description')}
                        className="absolute inset-0 w-full h-full border-none bg-[#1A1A1A] text-emerald-400/90 p-6 focus-visible:ring-0 leading-relaxed font-mono text-[11px] resize-none"
                        placeholder="Write your HTML code here..."
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full p-8 overflow-y-auto bg-white custom-scrollbar">
                        {descriptionValue ? (
                            <div
                                className="html-content text-[#444] text-[14px] leading-relaxed font-light prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-primary/70"
                                dangerouslySetInnerHTML={{ __html: descriptionValue }}
                            />
                        ) : (
                            <p className="text-primary/20 italic text-sm">No content to preview.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
