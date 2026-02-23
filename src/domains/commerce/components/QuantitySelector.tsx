'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuantitySelectorProps {
    value: number
    onChange: (value: number) => void
    max?: number
}

export function QuantitySelector({ value, onChange, max = 99 }: QuantitySelectorProps) {
    const decrement = () => {
        if (value > 1) onChange(value - 1)
    }

    const increment = () => {
        if (value < max) onChange(value + 1)
    }

    return (
        <div className="flex items-center bg-secondary/50 rounded-2xl p-1 border border-border/20 w-fit">
            <Button
                variant="ghost"
                size="icon"
                onClick={decrement}
                disabled={value <= 1}
                className="w-10 h-10 rounded-xl hover:bg-white hover:text-accent transition-all"
            >
                <Minus size={14} />
            </Button>

            <span className="w-12 text-center text-sm font-bold font-mono">
                {value}
            </span>

            <Button
                variant="ghost"
                size="icon"
                onClick={increment}
                disabled={value >= max}
                className="w-10 h-10 rounded-xl hover:bg-white hover:text-accent transition-all"
            >
                <Plus size={14} />
            </Button>
        </div>
    )
}
