import client from "@/api";
import { queryOptions } from "@tanstack/react-query";

export const profileQuery = queryOptions({
	queryKey: ["me"],
	queryFn: async () => {
		const { data: me } = await client.profile.me.get();
		return me;
	}
})
