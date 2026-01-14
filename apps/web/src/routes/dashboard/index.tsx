import { createFileRoute } from "@tanstack/react-router";
import { KPICard, type KpisProps } from "./-components/card";
import { Users, Building2, Activity } from "lucide-react"

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
});

const cards: Array<KpisProps> = [
  {
    title: "Active Beneficiaries",
    value: "24,583",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Total Clinics",
    value: "142",
    change: "+5 this month",
    changeType: "positive" as const,
    icon: Building2,
  },
  {
    title: "Monthly Active Users",
    value: "18,294",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Activity,
  },
]

function RouteComponent() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((kpi) => (
          <KPICard title={kpi.title} value={kpi.value} change={kpi.change} changeType={kpi.changeType} icon={kpi.icon} />
        ))}
      </div>
      <div>
        Gráfico
      </div>
      <div>
        Lista de atividades
      </div>
    </div>
  )
}
