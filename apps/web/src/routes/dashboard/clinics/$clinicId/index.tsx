import { createFileRoute, useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { DoctorCard } from "./-components/doctor-card.tsx";
import { doctorsQuery } from "./-queries";
import {
	useQuery,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { usePaginationSearchParams } from "@/hooks/use-pagination-searchparams.ts";
import { Treaty } from "@elysiajs/eden";
import client from "@/api/index.ts";
import { DoctorsDataTable } from "./-components/data-table.tsx";
import { clinicById } from "../-queries/index.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { VerifiedIcon } from "lucide-react";
import { CreateDoctorDialog } from "./-components/create-doctor-dialog.tsx";

type Search = {
	page: number;
	perPage: number;
};
export const Route = createFileRoute("/dashboard/clinics/$clinicId/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): Search => {
		return {
			page: Number(search?.page ?? 1),
			perPage: Number(search?.perpage ?? 10),
		} as Search;
	},
	loader: async ({ context, location, params }) => {
		const search: Search = location.search as Search;
		return context.queryClient.ensureQueryData(
			doctorsQuery(search.page, search.perPage, params.clinicId),
		);
	},
});

function RouteComponent() {
	const { clinicId } = useParams({ from: "/dashboard/clinics/$clinicId" });
	const { data: clinic } = useQuery(clinicById(clinicId));
	return (
		<div>
			<div className="w-full flex items-center justify-between mb-6">
				<div>
					<div className="flex gap-2">
						<h1 className="text-3xl font-semibold text-foreground tracking-tight">
							{clinic?.name}
						</h1>
						<Badge variant="default">
							<VerifiedIcon />
							Clínica ativa
						</Badge>
					</div>

					<p className="text-muted-foreground mt-1">
						Visualize e gerencie médicos da clinica.
					</p>
				</div>
				<CreateDoctorDialog />
			</div>

			<Suspense fallback={<div>Carregando...</div>}>
				<DoctorsDataTable />
			</Suspense>
		</div>
	);
}
