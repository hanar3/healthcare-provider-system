import client from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const queryKeys = {
	LIST_BENEFICIARIES: "beneficiaries",
	SHOW_ORGANIZATION: "show-organization",
};

export const beneficiariesQuery = (page: number, limit: number) =>
	queryOptions({
		queryKey: [queryKeys.LIST_BENEFICIARIES, page, limit],
		queryFn: async () => {
			// TODO: Implement this endpoint
			return { total: 0, list: [] };
		},
	});

export const organizationQuery = (orgId: string) =>
	queryOptions({
		queryKey: [queryKeys.SHOW_ORGANIZATION, orgId],
		queryFn: async () => {
			const { data } = await client.organizations({ id: orgId }).get();
			return data;
		},
	});
