import { createContext } from "react";
import { createContextualCan } from "@casl/react";
import { createMongoAbility } from "@casl/ability";
import { defineAbilityFor } from "@workspace/common/auth/ability";
import client from "./api";
import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/queries/profile.query";

export const AbilityContext = createContext(createMongoAbility());
export const Can = createContextualCan(AbilityContext.Consumer);

export const AbilityProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { data: userPayload } = useQuery(profileQuery);

	const ability = defineAbilityFor(userPayload);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
};
