import { queryOptions, skipToken } from "@tanstack/react-query";
import client from "@/api";

export const queryKeys = {
	LIST_CLINICS: "list-clinics",
	SHOW_CLINIC: "show-clinic",
};

export function clinicsQuery(
	page: number,
	limit: number,
	name?: string,
	address?: string,
) {
	return queryOptions({
		queryKey: [queryKeys.LIST_CLINICS, page, limit, name, address],
		queryFn: async () => {
			const { data } = await client.clinics.get({
				query: { page, limit, name, address },
			});
			return data;
		},
	});
}

export function clinicById(id?: string) {
	return queryOptions({
		queryKey: [queryKeys.SHOW_CLINIC, id],
		queryFn: id
			? async () => {
				const { data } = await client.clinics({ id }).get();
				return data;
			}
			: skipToken,
	});
}
