import { DashboardSettingsForm } from "@/domains/admin/components/DashboardSettingsForm"

export default function DashboardContentPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-serif">Gestion du Dashboard</h1>
                <p className="text-muted-foreground mt-1">Personnalisez les messages et les accès pour chaque niveau de partenariat.</p>
            </div>

            <DashboardSettingsForm />
        </div>
    )
}
