import { useNavigate } from "@tanstack/react-router";
import { SearchCard } from "./search-card";

type Form = {
	specialties: string[];
	address: string;
};

export function SearchHero() {
	const navigate = useNavigate();

	return (
		<section className="flex flex-col h-screen bg-[url(/search-bg.jpg)] bg-no-repeat bg-cover items-center justify-center bg-center">
			<div className="container px-4">
				<div className="flex flex-col items-center justify-center mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-center text-slate-800 text-balance bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
						Encontre o cuidado certo, agora mesmo.
					</h1>
					<span className="mt-3 max-w-xl text-base text-slate-600 ">
						Encontre médicos e clínicas credenciadas próximos a você em segundos
					</span>
				</div>

				<SearchCard
					onSearch={(value) => {
						navigate({
							to: "/search",
							search: { l: value.address, e: value.specialties.join(",") },
						});
					}}
				/>
			</div>
		</section>
	);
}
