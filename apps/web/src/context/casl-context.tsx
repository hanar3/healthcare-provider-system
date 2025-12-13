import { createContext } from "react";
import { createContextualCan } from "@casl/react";
import { createMongoAbility } from "@casl/ability";
import { defineAbilityFor } from "@workspace/common/auth/ability";
import client from "./api";

export const AbilityContext = createContext(createMongoAbility());
export const Can = createContextualCan(AbilityContext.Consumer);

export const AbilityProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const userPayload = {
		id: 1,
		isSuperAdmin: false,
		orgAccessIds: [10],
		clinicAccessIds: [],
	};

	const ability = defineAbilityFor(userPayload);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
};
