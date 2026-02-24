import { getAnalyticsStats } from '@/domains/admin/admin-actions'
import { AnalyticsDashboard } from '@/domains/admin/components/AnalyticsDashboard'
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
    const stats = await getAnalyticsStats()

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Analyses & Business</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light">Suivez la performance de votre académie et de votre boutique.</p>
                </div>
                <Button variant="outline" className="border-slate-200">
                    <Download className="w-4 h-4 mr-2" /> Exporter PDF
                </Button>
            </header>

            <AnalyticsDashboard stats={stats} />
        </div>
    )
}
