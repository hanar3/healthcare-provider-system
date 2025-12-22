import { parseAsInteger, useQueryState } from "nuqs";
import { DataTable } from "@/components/data-table";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { organizationsQuery } from "@/routes/dashboard/organizations/-queries";

import { OrganizationsGet } from "@/api";
import { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";
import { DataTablePagination } from "@/components/table-pagination";
import { usePaginationSearchParams } from "@/hooks/use-pagination-searchparams";
import { Suspense, useTransition } from "react";

type Organization = OrganizationsGet["list"][0];

const formatCNPJ = (v: string) =>
	v
		.replace(/\D/g, "")
		.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

const plans = ["Prata", "Ouro"];
export const columns: ColumnDef<Organization>[] = [
	{
		accessorKey: "name",
		header: "Nome",
	},
	{
		accessorKey: "govId",
		header: "CNPJ",
		cell: (info) => {
			return formatCNPJ(info.getValue<string>());
		},
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "plan",
		header: "Plano",
		cell: (info) => {
			return plans[info.getValue<number>()];
		},
	},
	{
		accessorKey: "createdAt",
		header: "Data de criação",
	},
];

export function OrganizationsDataTable() {
	const [pagination, setPagination] = usePaginationSearchParams();
	const [isPending, startTransition] = useTransition();
	const { data } = useSuspenseQuery(
		organizationsQuery(pagination.pageIndex, pagination.pageSize),
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
		<>
			{JSON.stringify(pagination)}
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
		</>
	);
}
