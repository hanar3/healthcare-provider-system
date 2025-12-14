import { DataTable } from "@/components/data-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { organizationsQuery } from "@/routes/dashboard/organizations/-queries";

import { OrganizationsGet } from "@/api";
import { ColumnDef } from "@tanstack/react-table";

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
	const { data } = useSuspenseQuery(organizationsQuery(0, 10));
	return <DataTable columns={columns} data={data?.list || []} />;
}
