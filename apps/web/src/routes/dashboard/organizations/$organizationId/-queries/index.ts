import client from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const queryKeys = {
	LIST_BENEFICIARIES: "beneficiaries",
	SHOW_ORGANIZATION: "show-organization",
};

export const beneficiariesQuery = (
	page: number,
	limit: number,
	organizationId?: string,
) =>
	queryOptions({
		queryKey: [queryKeys.LIST_BENEFICIARIES, page, limit],
		queryFn: async () => {
			const { data } = await client.beneficiaries.get({
				query: {
					page,
					limit,
					organizationId,
				},
			});
			return data;
		},
	});
