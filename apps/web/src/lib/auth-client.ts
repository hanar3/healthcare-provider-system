import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "../../../api/src/lib/auth";
export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [inferAdditionalFields<typeof auth>()],
});
