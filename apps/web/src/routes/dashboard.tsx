import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AbilityProvider } from "@/context/casl-context";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session || "code" in session) {
			throw redirect({
				to: "/login",
			});
		}
	},
});

function RouteComponent() {
	return (
		<AbilityProvider>
			<SidebarProvider>
				<AppSidebar />
				<main>
					<SidebarTrigger />
					<Outlet />
				</main>
			</SidebarProvider>
		</AbilityProvider>
	);
}
