import { queryOptions } from "@tanstack/react-query";
import client from "../../../api";

export const dashboardQueryKey = {
	SHOW_BENEFICIARY: "show-beneficiary",
};

export function beneficiaryById(id: string) {
	return queryOptions({
		queryKey: [dashboardQueryKey.SHOW_BENEFICIARY, id],
		queryFn: async () => {
			const { data } = await client.beneficiaries({ id }).get();
			return data;
		},
	});
}

export function adminStatsQuery() {
	return queryOptions({
		queryKey: ["admin-stats"],
		queryFn: async () => {
			const { data } = await client.stats["admin-summary"].get();
			return data;
		},
	});
}
