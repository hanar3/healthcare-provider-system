import { DataTable } from "@/components/data-table";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { beneficiariesQuery } from "@/routes/dashboard/organizations/$organizationId/-queries";
import { Link } from "@tanstack/react-router";
import type { ClinicsGet } from "@/api";
import type {
	ColumnDef,
	PaginationState,
	Updater,
} from "@tanstack/react-table";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { DataTablePagination } from "@/components/table-pagination";
import { usePaginationSearchParams } from "@/hooks/use-pagination-searchparams";
import { useTransition } from "react";
import { clinicsQuery } from "../-queries";
import { formatCNPJ } from "@/lib/utils";
import { CreateClinicDialog } from "./create-clinic-dialog";
import { DeleteClinicDialog } from "./delete-clinic";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/context/casl-context";

type Clinic = ClinicsGet["list"][0];

export const columns: ColumnDef<Clinic>[] = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: (info) => {
			return (
				<Link
					to="/dashboard/clinics/$clinicId"
					params={{ clinicId: info.row.original.id }}
					search={{ page: 1, perPage: 10 }}
					className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
				>
					{info.getValue<string>()}
				</Link>
			);
		},
	},
	{
		accessorKey: "govId",
		header: "CNPJ",
		cell: (info) => {
			const value = info.getValue<string>();
			return value ? formatCNPJ(info.getValue<string>()) : "-";
		},
	},
	{
		accessorKey: "address",
		header: "Endereço",
		cell: (info) => {
			const value = info.getValue<string>();
			return value;
		},
	},

	{
		accessorKey: "createdAt",
		header: "Data de criação",
		cell: (info) => {
			return format(info.getValue<string>(), "dd 'de' MMMM 'de' yyyy", {
				locale: ptBR,
			});
		},
	},
	{
		accessorKey: "updatedAt",
		header: "Última atualização",
		cell: (info) => {
			return format(info.getValue<string>(), "dd 'de' MMMM 'de' yyyy", {
				locale: ptBR,
			});
		},
	},
	{
		id: "actions",
		cell: (info) => {
			return (
				<div className="flex">
					<CreateClinicDialog
						id={info.row.original.id}
						trigger={
							<Button size="sm" variant="ghost">
								<Edit size="14px" />
							</Button>
						}
					/>
					<Can I="delete" a="Clinic">
						<DeleteClinicDialog id={info.row.original.id} />
					</Can>
				</div>
			);
		},
	},
];

export function ClinicsDataTable() {
	const [pagination, setPagination] = usePaginationSearchParams();
	const [isPending, startTransition] = useTransition();

	const { data } = useQuery(
		clinicsQuery(pagination.pageIndex, pagination.pageSize),
	);

	const pageCount = Math.ceil((data?.total ?? 0) / pagination.pageSize);
	const handlePaginationChange = (updaterOrValue: Updater<PaginationState>) => {
		const newPagination =
			typeof updaterOrValue === "function"
				? updaterOrValue(pagination)
				: updaterOrValue;

		startTransition(() => {
			setPagination(newPagination);
		});
	};

	return (
		<DataTable
			columns={columns}
			data={data?.list || []}
			manualPagination
			pageCount={pageCount}
			rowCount={data?.total}
			initialState={{
				pagination,
			}}
			state={{
				pagination,
			}}
			onPaginationChange={handlePaginationChange}
			paginationComponent={(table) => (
				<DataTablePagination table={table} isPending={isPending} />
			)}
		/>
	);
}
