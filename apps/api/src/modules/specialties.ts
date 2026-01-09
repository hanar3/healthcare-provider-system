import { db } from "../db";
import { specialties } from "../db/schema";
import Elysia from "elysia";

export const specialtiesController = new Elysia({ prefix: "/specialties" })
	.get("/", () => {
		return db.select().from(specialties);
	})
