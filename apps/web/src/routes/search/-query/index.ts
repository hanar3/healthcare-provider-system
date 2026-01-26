import client from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const searchQueryKeys = {
	SEARCH: "search",
};
export const searchQuery = (specialties: string[], address: string) => {
	return queryOptions({
		queryKey: [searchQueryKeys.SEARCH, specialties, address],
		queryFn: async () => {
			const { data } = await client.search.get({
				query: {
					specialtySlugs: specialties,
					address,
				},
			});
			return data;
		},
	});
};
