import { DataTable } from "@/components/data-table";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { organizationsQuery } from "@/routes/dashboard/organizations/-queries";

import type { OrganizationsGet } from "@/api";
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
import { Badge } from "@/components/ui/badge";
import {
	BadgeCheckIcon,
	BadgeX,
	Award,
	Pencil,
	Trash,
	BanknoteX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableRowActions } from "@/components/table-row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteOrganizationDialog } from "./delete-organization";

type Organization = OrganizationsGet["list"][0];

const formatCNPJ = (v: string) =>
	v
		.replace(/\D/g, "")
		.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

const plans = ["Prata", "Ouro"];

const statusMap = {
	active: "Adimplente",
	defaulting: "Inadimplente",
};

export const columns: ColumnDef<Organization>[] = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: (info) => {
			return (
				<Link
					to="/dashboard/organizations/$organizationId"
					params={{ organizationId: info.row.original.id }}
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
			return formatCNPJ(info.getValue<string>());
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: (info) => {
			const value = info.getValue<"active" | "defaulting">();
			return (
				<Badge
					className={cn({
						"border-green-500": value === "active",
						"border-red-500": value === "defaulting",
					})}
					variant="outline"
				>
					{value === "active" ? <BadgeCheckIcon /> : <BadgeX />}
					{statusMap[value]}
				</Badge>
			);
		},
	},
	{
		accessorKey: "plan",
		header: "Plano",
		cell: (info) => {
			const value = info.getValue<0 | 1>();
			return (
				<Badge
					className={cn({
						"bg-stone-300": value === 0,
						"bg-amber-300": value === 1,
					})}
					variant="secondary"
				>
					<Award />
					{plans[info.getValue<number>()]}
				</Badge>
			);
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
		id: "actions",
		cell: (info) => {
			return (
				<TableRowActions>
					<DropdownMenuItem onClick={(e) => e.preventDefault()}>
						<DeleteOrganizationDialog id={info.row.original.id} />
					</DropdownMenuItem>
				</TableRowActions>
			);
		},
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
