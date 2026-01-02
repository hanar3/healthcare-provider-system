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
	LogOut,
	Settings,
	Stethoscope,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

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
	const navigate = useNavigate();
	async function handleLogout() {
		await authClient.signOut();
		navigate({
			to: '/',
		});
	}
	return (
		<Sidebar>
			<SidebarHeader className="border-b p-2">
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
			<SidebarFooter>
				<div className="border-t border-border p-4">
					<div className="flex items-center gap-3 rounded-lg px-3 py-2">
						<Avatar className="h-9 w-9">
							<AvatarImage src="/professional-doctor.png" alt="Dr. Sarah Johnson" />
							<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">SJ</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-foreground truncate">Dr. Sarah Johnson</p>
							<p className="text-xs text-muted-foreground truncate">Administrator</p>
						</div>
						<Button onClick={handleLogout} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
							<LogOut className="h-4 w-4" />
							<span className="sr-only">Logout</span>
						</Button>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
