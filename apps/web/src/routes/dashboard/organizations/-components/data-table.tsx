import { DataTable } from "@/components/data-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { organizationsQuery } from "@/routes/dashboard/organizations/-queries";

import { OrganizationsGet } from "@/api";
import { ColumnDef } from "@tanstack/react-table";

type Organization = OrganizationsGet["list"][0];

const plans = ["Prata", "Ouro"];
export const columns: ColumnDef<Organization>[] = [
	{
		accessorKey: "name",
		header: "Nome",
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
