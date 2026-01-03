import { Button } from "@/components/ui/button";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { organizationQuery } from "../-queries";
import { beneficiariesQuery } from "./-queries";
import { Suspense } from "react";
import { BeneficiariesDataTable } from "./-components/data-table";
import { useQuery } from "@tanstack/react-query";
import { formatCNPJ } from "@/lib/utils";
import { CreateBeneficiaryDialog } from "./-components/create-beneficiary";

type BeneficiarySearch = {
	page: number;
	perPage: number;
};

export const Route = createFileRoute(
	"/dashboard/organizations/$organizationId/",
)({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): BeneficiarySearch => {
		return {
			page: Number(search?.page ?? 1),
			perPage: Number(search?.perpage ?? 10),
		} as BeneficiarySearch;
	},
	loader: async ({ context, location, params }) => {
		const search: BeneficiarySearch = location.search as BeneficiarySearch;
		return context.queryClient.ensureQueryData(
			beneficiariesQuery(search.page, search.perPage, params.organizationId),
		);
	},
});

function RouteComponent() {
	const { organizationId } = useParams({
		strict: true,
		from: "/dashboard/organizations/$organizationId",
	});

	const { data: organization } = useQuery(organizationQuery(organizationId));
	return (
		<div>
			<div className="w-full flex items-center justify-between mb-6">
				<div>
					<div className="flex gap-2 items-baseline">
						<h1 className="text-3xl font-semibold text-foreground tracking-tight">
							{organization?.name}
						</h1>
						{organization?.govId ? (
							<small>{formatCNPJ(organization?.govId)}</small>
						) : null}
					</div>

					<p className="text-muted-foreground mt-1">
						Visualize e gerencie os empregados de {organization?.name}
					</p>
				</div>
				<div className="flex gap-3">
					<Button variant="outline" className="gap-2 bg-transparent">
						<Upload className="h-4 w-4" />
						Importar CSV
					</Button>
					<CreateBeneficiaryDialog />
				</div>
			</div>

			<Suspense fallback={<div>Carregando...</div>}>
				<BeneficiariesDataTable />
			</Suspense>
		</div>
	);
}
