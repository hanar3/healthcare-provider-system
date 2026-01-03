import client, { OrganizationGet } from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const queryKeys = {
	LIST_ORGANIZATIONS: "organizations",
	SHOW_ORGANIZATION: "show-organization",
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

export const organizationQuery = (
	orgId: string,
	opts?: { onSuccess?: (data: OrganizationGet | null) => void },
) =>
	queryOptions({
		queryKey: [queryKeys.SHOW_ORGANIZATION, orgId],
		queryFn: async () => {
			const { data } = await client.organizations({ id: orgId }).get();
			opts?.onSuccess?.(data);
			return data;
		},
	});
