'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateInventoryStock } from '../admin-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AdjustStockButtonProps {
    variantId: string
    currentStock: number
    sku: string
}

export function AdjustStockButton({ variantId, currentStock, sku }: AdjustStockButtonProps) {
    const [open, setOpen] = useState(false)
    const [stock, setStock] = useState(currentStock)
    const [loading, setLoading] = useState(false)

    async function handleUpdate() {
        if (isNaN(stock) || stock < 0) {
            toast.error("Veuillez saisir un nombre valide superior ou égal à 0")
            return
        }

        setLoading(true)
        try {
            await updateInventoryStock(variantId, stock)
            toast.success(`Stock mis à jour pour ${sku}`)
            setOpen(false)
        } catch (e: any) {
            toast.error(e.message || "Erreur de mise à jour")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[10px] border-slate-200 hover:border-accent hover:text-accent">Ajuster</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajuster le Stock</DialogTitle>
                    <p className="text-xs text-muted-foreground">SKU: {sku}</p>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">Quantité</Label>
                        <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={isNaN(stock) ? "" : stock}
                            onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseInt(e.target.value)
                                setStock(val)
                            }}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button className="bg-accent text-white" onClick={handleUpdate} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
