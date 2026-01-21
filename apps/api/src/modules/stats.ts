import { db } from "../db";
import { clinics, organizations, profile, specialties } from "../db/schema";
import Elysia from "elysia";
import { authPlugin } from "../plugins/authPlugin";
import { sql } from "drizzle-orm";

interface Stat<T extends string> {
	type: T;
	value: number;
	change: number; // the diference in the total compared to last month's stats
	changeType: "positive" | "negative"; // whether the diff is positive or negative
}




const formatStat = <T extends string>(
	type: T,
	total: number,
	curr: number,
	previous: number
) => {
	const value = Number(total);
	const prev = Number(previous);
	const diff = value - prev;

	return {
		type,
		value: value,
		change: Math.abs(diff),
		changeType: diff >= 0 ? ("positive" as const) : ("negative" as const),
	};
};
export const statsController = new Elysia({ prefix: "/stats" })
	.use(authPlugin)
	.get("/admin-summary", async () => {
		type CountJson = {
			total: number;
			curr: number;
			prev: number;
		};

		type RawStatsResult = {
			clinics: CountJson;
			orgs: CountJson;
			beneficiaries: CountJson;
		};

		const startOfMonth = sql`date_trunc('month', now())`;
		const result = await db.execute<RawStatsResult>(sql`
    WITH 
    clinic_stats AS (
      SELECT 
        count(*) as total, 
				count(*) FILTER (WHERE ${clinics.createdAt} > ${startOfMonth}) as curr,
        count(*) FILTER (WHERE ${clinics.createdAt} < ${startOfMonth}) as prev
      FROM ${clinics}
    ),
    org_stats AS (
      SELECT 
        count(*) as total, 
				count(*) FILTER (WHERE ${organizations.createdAt} > ${startOfMonth}) as curr,
        count(*) FILTER (WHERE ${organizations.createdAt} < ${startOfMonth}) as prev
      FROM ${organizations}
    ),
    beneficiary_stats AS (
      SELECT 
        count(*) as total, 
				count(*) FILTER (WHERE ${profile.createdAt} > ${startOfMonth}) as curr,
        count(*) FILTER (WHERE ${profile.createdAt} < ${startOfMonth}) as prev
      FROM ${profile}
      WHERE ${profile.role} = 'beneficiary'
    )
    SELECT 
      (SELECT row_to_json(clinic_stats) FROM clinic_stats) as clinics,
      (SELECT row_to_json(org_stats) FROM org_stats) as orgs,
      (SELECT row_to_json(beneficiary_stats) FROM beneficiary_stats) as beneficiaries
  `);


		const row = result[0];

		return [
			formatStat(
				"total_clinics",
				row?.clinics?.total ?? 0,
				row?.clinics?.curr ?? 0,
				row?.clinics?.prev ?? 0
			),
			formatStat(
				"total_beneficiaries",
				row?.beneficiaries?.total ?? 0,
				row?.beneficiaries?.curr ?? 0,
				row?.beneficiaries?.prev ?? 0,
			),
			formatStat(
				"total_organizations",
				row?.orgs?.total ?? 0,
				row?.orgs?.curr ?? 0,
				row?.orgs?.prev ?? 0
			),
		] satisfies [Stat<"total_clinics">, Stat<"total_beneficiaries">, Stat<"total_organizations">];;
	}, {
		isSignedIn: true,
	})
