import { createFileRoute } from "@tanstack/react-router";
import { ClinicsDataTable } from "./-components/data-table";
import { Suspense } from "react";
import { CreateClinicDialog } from "./-components/create-clinic-dialog";

type Search = {
	page: number;
	perPage: number;
};
export const Route = createFileRoute("/dashboard/clinics/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): Search => {
		return {
			page: Number(search?.page ?? 1),
			perPage: Number(search?.perpage ?? 10),
		} as Search;
	},
});

function RouteComponent() {
	return (
		<div>
			<div className="w-full flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-semibold text-foreground tracking-tight">
						Clínicas
					</h1>
					<p className="text-muted-foreground mt-1">
						Visualize e gerencie clínicas ativas.
					</p>
				</div>
				<div className="flex gap-3">
					<CreateClinicDialog />
				</div>
			</div>

			<Suspense fallback={<div>Carregando...</div>}>
				<ClinicsDataTable />
			</Suspense>
		</div>
	);
}
