import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Can } from "@/context/casl-context";
import {
	Activity,
	Building2,
	LayoutDashboard,
	Settings,
	Stethoscope,
	Users,
} from "lucide-react";

const PREFIX = "/dashboard";
const items = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: PREFIX,
		abilities: [],
	},
	{
		title: "Empresas",
		icon: Building2,
		href: PREFIX + "/organizations",
		abilities: ["read", "Organization"],
	},
	{
		title: "Clinicas",
		icon: Stethoscope,
		href: PREFIX + "/clinics",
		abilities: ["read", "Clinic"],
	},
	{
		title: "Beneficiários",
		icon: Users,
		href: PREFIX + "/beneficiaries",
		abilities: ["read", "Beneficiary"],
	},
	{
		title: "Configurações",
		icon: Settings,
		href: PREFIX + "/settings",
		abilities: [],
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className="border-b border-border">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<Activity className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="text-lg font-semibold text-foreground">MedCare</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroupLabel>Sistema</SidebarGroupLabel>
				<SidebarGroupContent>
					{items.map((item) =>
						item.abilities.length ? (
							<Can key={item.title} I={item.abilities[0]} a={item.abilities[1]}>
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</Can>
						) : (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<a href={item.href}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						),
					)}
				</SidebarGroupContent>
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
