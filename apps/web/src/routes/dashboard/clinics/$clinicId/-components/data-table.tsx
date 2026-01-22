import { DataTable } from "@/components/data-table";
import { useQuery } from "@tanstack/react-query";

import type { DoctorsGet } from "@/api";
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
import { useParams } from "@tanstack/react-router";
import { doctorsQuery } from "../-queries";
import { Badge } from "@/components/ui/badge";
import { CreateDoctorDialog } from "./create-doctor-dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { DeleteDoctorDialog } from "./delete-doctor-dialog";

type Doctor = DoctorsGet["list"][0];

export const columns: ColumnDef<Doctor>[] = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: (info) => {
			return info.getValue<string>();
		},
	},
	{
		accessorKey: "govId",
		header: "CRM",
		cell: (info) => {
			return info.getValue<string>();
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
		accessorKey: "specialties",
		header: "Especializações",
		cell: (info) => {
			return info.getValue<Doctor["specialties"]>().map((specialty) => {
				return (
					<Badge key={specialty.id} variant="secondary">
						{specialty.name}
					</Badge>
				);
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
				<div className="flex gap-2">
					<CreateDoctorDialog
						id={info.row.original.id}
						trigger={
							<Button size="sm" variant="ghost">
								<Edit size="14px" />
							</Button>
						}
					/>
					<DeleteDoctorDialog id={info.row.original.id} />
				</div>
			);
		},
	},
];

export function DoctorsDataTable() {
	const { clinicId } = useParams({
		from: "/dashboard/clinics/$clinicId",
	});
	const [pagination, setPagination] = usePaginationSearchParams();
	const [isPending, startTransition] = useTransition();

	const { data } = useQuery(
		doctorsQuery(pagination.pageIndex, pagination.pageSize, clinicId),
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
