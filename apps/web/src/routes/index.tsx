import { SearchHeader } from "@/components/search-header";
import { SearchHero } from "@/components/search-hero";
import { createFileRoute } from "@tanstack/react-router";
import { doctorSpecialties } from "./dashboard/clinics/$clinicId/-queries";

export const Route = createFileRoute("/")({
	component: LandingPage,
	loader: ({ context }) => {
		return context.queryClient.ensureQueryData(doctorSpecialties());
	},
});

function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			<SearchHeader />
			<SearchHero />
		</div>
	);
}
