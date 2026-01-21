import { createFileRoute } from "@tanstack/react-router";
import { KPICard, type KpisProps } from "./-components/card";
import { Users, Building2 } from "lucide-react"

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
});

const cards: Array<KpisProps> = [
	{
		title: "Beneficiários Ativos",
		value: "24,583",
		change: "+12.5%",
		changeType: "positive" as const,
		icon: Users,
	},
	{
		title: "Total de Clínicas",
		value: "142",
		change: "+5 esse mês",
		changeType: "positive" as const,
		icon: Building2,
	},
	{
		title: "Total de Empresas",
		value: "125",
		change: "+8.2%",
		changeType: "positive" as const,
		icon: Building2,
	},
]

function RouteComponent() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-semibold text-foreground tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground mt-1">Bem vindo de volta! Um resumo de hoje.</p>
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
