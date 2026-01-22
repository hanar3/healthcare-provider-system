import { SearchHeader } from "@/components/search-header";
import { SearchHero } from "@/components/search-hero";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: LandingPage,
	loader: (ctx) => {},
});

function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			<SearchHeader />
			<SearchHero />
		</div>
	);
}
