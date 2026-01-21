import { createFileRoute } from "@tanstack/react-router";
import { KPICard, type KpisProps } from "./-components/card";
import { Users, Building2, Hospital, LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminStatsQuery } from "./-queries";

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
];

const startCardPropsByType: Record<
	"total_clinics" | "total_beneficiaries" | "total_organizations",
	{ icon: LucideIcon; title: string }
> = {
	total_clinics: {
		icon: Hospital,
		title: "Total de Clínicas",
	},
	total_beneficiaries: {
		icon: Users,
		title: "Total de Beneficiários",
	},
	total_organizations: {
		icon: Building2,
		title: "Total de Empresas",
	},
};

function RouteComponent() {
	const { data: stats } = useQuery(adminStatsQuery());
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-semibold text-foreground tracking-tight">
					Dashboard
				</h1>
				<p className="text-muted-foreground mt-1">
					Bem vindo de volta! Um resumo de hoje.
				</p>
			</div>
			<div className="grid gap-6 md:grid-cols-3">
				{stats?.map((kpi) => (
					<KPICard
						key={kpi.type}
						title={startCardPropsByType[kpi.type].title}
						value={kpi.value}
						change={kpi.change}
						changeType={kpi.changeType}
						icon={startCardPropsByType[kpi.type].icon}
					/>
				))}
			</div>
			<div>Gráfico</div>
			<div>Lista de atividades</div>
		</div>
	);
}
