import { useMatches } from "@tanstack/react-router";

export const useBreadcrumbs = () =>
	useMatches()
		.map((m) => {
			console.log({
				label: m.staticData?.breadcrumb?.({
					params: m.params,
					loaderData: m.loaderData,
				}),
				href: m.pathname,
			});
			return {
				label: m.staticData?.breadcrumb?.({
					params: m.params,
					loaderData: m.loaderData,
				}),
				href: m.pathname,
			};
		})
		.filter((b) => b.label);
