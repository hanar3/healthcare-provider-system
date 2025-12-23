import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/organizations")({
  component: RouteComponent,
  staticData: {
    breadcrumb: () => {
      return "Empresas";
    },
  },
});

function RouteComponent() {
  return <Outlet />;
}
