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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/queries/profille.query";

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

function SidebarLogOut(props: { name?: string; role?: string, isLoading: boolean }) {
	const navigate = useNavigate();
	async function handleLogout() {
		await authClient.signOut();
		navigate({
			to: "/",
		});
	}

	return props.isLoading ?
		(
			<div className="flex items-center space-x-4">
				<Skeleton className="h-12 w-12 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-[150px]" />
					<Skeleton className="h-4 w-[100px]" />
				</div>
			</div>
		) : (
			<div className="border-t border-border p-4">
				<div className="flex items-center gap-3 rounded-lg  ">
					<Avatar className="h-9 w-9">
						<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
							SJ
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-foreground truncate">
							{props?.name ?? "Usuário desconhecido"}
						</p>
						<p className="text-xs text-muted-foreground truncate">{props.role ?? "Cargo desconhecido"}</p>
					</div>
					<Button
						onClick={handleLogout}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-foreground"
					>
						<LogOut className="h-4 w-4" />
						<span className="sr-only">Sair</span>
					</Button>
				</div>
			</div>
		);
}

export function AppSidebar() {
	const { data: me, isLoading } = useQuery(profileQuery);

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
				<SidebarLogOut isLoading={isLoading} name={me?.name} role={me?.role} />
			</SidebarFooter>
		</Sidebar>
	);
}
