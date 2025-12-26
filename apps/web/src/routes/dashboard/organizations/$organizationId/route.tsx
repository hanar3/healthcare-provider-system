import { createFileRoute, Outlet } from "@tanstack/react-router";
import { organizationQuery } from "./-queries";

export const Route = createFileRoute(
  "/dashboard/organizations/$organizationId",
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.fetchQuery(
      organizationQuery(params.organizationId),
    );
    return data;
  },
  staticData: {
    breadcrumb: ({ loaderData }) => {
      return (loaderData as { name?: string })?.name ?? "";
    },
  },
});

function RouteComponent() {
  return <Outlet />;
}
