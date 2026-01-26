import { parseAsString, parseAsArrayOf, useQueryStates } from "nuqs";
import { SearchCard } from "@/components/search-card";
import { SearchHeader } from "@/components/search-header";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Hospital, MapPin, Phone } from "lucide-react";
import { searchQuery } from "./-query";

export const Route = createFileRoute("/search/")({
	component: RouteComponent,
	validateSearch: (
		search: Record<string, unknown>,
	): Partial<{ e: string; l: string }> => {
		return {
			e: search?.e ? String(search?.e) : "",
			l: search?.l ? String(search?.l) : "",
		} satisfies Partial<{ e: string; l: string }>;
	},
});

import { useMemo } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClinicSpecialtiesProps {
	specialties: { name: string; slug: string; id: string }[];
	searchQuery?: string | string[];
	maxVisible?: number;
}

export function ClinicSpecialties({
	specialties = [],
	searchQuery = [],
	maxVisible = 4,
}: ClinicSpecialtiesProps) {
	const { visible, hidden } = useMemo(() => {
		const searchTerms = Array.isArray(searchQuery)
			? searchQuery
			: [searchQuery].filter(Boolean);

		const lowerTerms = searchTerms.map((t) => t?.toLowerCase());

		const matches: { name: string; slug: string; id: string }[] = [];
		const others: { name: string; slug: string; id: string }[] = [];

		specialties.forEach((s) => {
			if (lowerTerms.some((term) => s.slug.toLowerCase().includes(term))) {
				matches.push(s);
			} else {
				others.push(s);
			}
		});

		const sorted = [...matches, ...others];

		return {
			visible: sorted.slice(0, maxVisible),
			hidden: sorted.slice(maxVisible),
		};
	}, [specialties, searchQuery, maxVisible]);

	if (!specialties.length) return null;

	console.log(searchQuery);
	return (
		<div className="flex flex-wrap gap-1.5 items-center">
			{visible.map((s) => {
				const isMatch = Array.isArray(searchQuery)
					? searchQuery.some((q) =>
						s.slug.toLowerCase().includes(q.toLowerCase()),
					)
					: s.slug
						.toLowerCase()
						.includes(((searchQuery as string) || "").toLowerCase());

				return (
					<Badge
						key={s.id}
						variant={isMatch ? "default" : "secondary"}
						className={!isMatch ? "text-muted-foreground font-normal" : ""}
					>
						{s.name}
					</Badge>
				);
			})}

			{hidden.length > 0 && (
				<TooltipProvider>
					<Tooltip delayDuration={200}>
						<TooltipTrigger asChild>
							<Badge variant="outline" className="cursor-help">
								+{hidden.length}
							</Badge>
						</TooltipTrigger>
						<TooltipContent className="max-w-[200px] p-2 bg-white">
							<div className="flex flex-wrap gap-1">
								{hidden.map((s) => (
									<span
										key={s.id}
										className="text-xs bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground"
									>
										{s.name}
									</span>
								))}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}

const searchParsers = {
	specialties: parseAsArrayOf(parseAsString).withDefault([]),
	address: parseAsString.withDefault(""),
};

const searchUrlKeys = {
	specialties: "e",
	address: "l",
};

export function useSearchParams() {
	return useQueryStates(searchParsers, {
		urlKeys: searchUrlKeys,
	});
}

function RouteComponent() {
	const search = useSearch({ from: "/search/" });
	const [params, setParams] = useSearchParams();
	const { data: searchResult } = useQuery(
		searchQuery(params.specialties.filter(Boolean), params.address),
	);

	return (
		<>
			<SearchHeader />
			<div className="h-screen max-w-4xl mx-auto">
				<div className="max-w-4xl mx-auto pt-24 px-8">
					<SearchCard
						defaultValues={{
							specialties: search?.e?.split(","),
							address: search.l,
						}}
						onSearch={(value) => {
							setParams({
								specialties: value.specialties,
								address: value.address,
							});
						}}
					/>
				</div>
				<div className="flex flex-col gap-2 px-10 mt-4">
					<h1 className="text-xl font-bold">Resultados da busca</h1>
					<h1 className="text-gray-700">
						Encontramos {searchResult?.total} resultados para a sua busca
					</h1>
				</div>
				<div className="flex flex-col gap-2 px-10 mt-4">
					{searchResult?.list?.map((r) => (
						<Card key={r.id}>
							<CardHeader>
								<div className="flex gap-2 items-center">
									<Hospital />
									<CardTitle>{r.name}</CardTitle>
								</div>
								<CardDescription>
									<div className="flex gap-2 items-center">
										<MapPin size={14} />
										<span>{r.address}</span>
									</div>
									<div className="flex gap-2 items-center">
										<Phone size={14} />
										<span>(11) 9999-9999</span>
									</div>
								</CardDescription>
								<CardContent className="p-0 flex gap-1.5 flex-wrap">
									<ClinicSpecialties
										specialties={r.specialties}
										searchQuery={params.specialties.filter(Boolean)}
										maxVisible={4}
									/>
								</CardContent>
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		</>
	);
}
