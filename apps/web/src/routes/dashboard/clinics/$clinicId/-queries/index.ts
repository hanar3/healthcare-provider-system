import { queryOptions, skipToken } from "@tanstack/react-query";
import client from "@/api";

export const queryKeys = {
	LIST_DOCTORS: "list-doctors",
	SHOW_DOCTOR: "show-doctor",
	LIST_SPECIALTIES: "list-specialties",
};

export function doctorsQuery(page: number, limit: number, clinicId?: string) {
	return queryOptions({
		queryKey: [queryKeys.LIST_DOCTORS, page, limit, clinicId],
		queryFn: async () => {
			const { data } = await client.doctors.get({
				query: { page, limit, clinicId },
			});
			return data;
		},
	});
}

export function doctorById(id?: string) {
	return queryOptions({
		queryKey: [queryKeys.SHOW_DOCTOR, id],
		queryFn: id
			? async () => {
					const { data } = await client.doctors({ id }).get();
					return data;
				}
			: skipToken,
	});
}

export function doctorSpecialties() {
	return queryOptions({
		queryKey: [queryKeys.LIST_SPECIALTIES],
		queryFn: async () => {
			const { data } = await client.specialties.get();
			return data;
		},
	});
}
