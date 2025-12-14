import { Link } from "@tanstack/react-router";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export const Breadcrumbs = () => {
	const crumbs = useBreadcrumbs();

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{crumbs.map((c, i) =>
					i < crumbs.length - 1 ? (
						<BreadcrumbItem key={c.href}>
							<BreadcrumbLink>
								<Link to={c.href}>{c.label}</Link>
							</BreadcrumbLink>
							<BreadcrumbSeparator />
						</BreadcrumbItem>
					) : (
						<BreadcrumbItem key={c.href}>
							<BreadcrumbPage>{c.label}</BreadcrumbPage>
						</BreadcrumbItem>
					),
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
