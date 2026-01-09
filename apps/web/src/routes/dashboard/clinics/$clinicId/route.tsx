import { createFileRoute, Outlet } from "@tanstack/react-router";
import { clinicById } from "../-queries";

export const Route = createFileRoute("/dashboard/clinics/$clinicId")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.fetchQuery(
      clinicById(params.clinicId),
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
