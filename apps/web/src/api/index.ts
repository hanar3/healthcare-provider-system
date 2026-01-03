import { treaty, type Treaty } from "@elysiajs/eden";

import type { App } from "../../../api/src/index";

const client = treaty<App>("localhost:3001");

export type OrganizationsGet = Treaty.Data<typeof client.organizations.get>;
export type OrganizationCreate = Parameters<
	typeof client.organizations.post
>[0];
export type BeneficiaryCreate = Parameters<typeof client.beneficiaries.post>[0];
export type OrganizationGet = Treaty.Data<
	Awaited<ReturnType<typeof client.organizations>["get"]>
>;

export default client;
