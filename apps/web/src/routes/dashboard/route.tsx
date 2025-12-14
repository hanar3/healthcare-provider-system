import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AbilityProvider } from "@/context/casl-context";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Breadcrumbs } from "./components/breadcrumbs";

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

	staticData: {
		breadcrumb: () => "Dashboard",
	},
});

function RouteComponent() {
	return (
		<AbilityProvider>
			<SidebarProvider>
				<AppSidebar />

				<main className="w-full">
					<div className="p-4 border-b h-[49px]">
						<Breadcrumbs />
					</div>
					<div className="p-8 space-y-6 w-full">
						<Outlet />
					</div>
				</main>
			</SidebarProvider>
		</AbilityProvider>
	);
}
