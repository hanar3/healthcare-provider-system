import client from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const queryKeys = {
	LIST_ORGANIZATIONS: "organizations",
};

export const organizationsQuery = (page: number, limit: number) =>
	queryOptions({
		queryKey: [queryKeys.LIST_ORGANIZATIONS, page, limit],
		queryFn: async () => {
			const { data } = await client.organizations.get({
				query: {
					page,
					limit,
				},
			});

			return data;
		},
	});
