import { treaty, type Treaty } from "@elysiajs/eden";

import type { App } from "../../../api/src/index";

const client = treaty<App>("localhost:3001");

export type OrganizationsGet = Treaty.Data<typeof client.organizations.get>;

export default client;
