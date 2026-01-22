import { MapPin, Search } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const specialties = [
	"Primary Care",
	"Cardiology",
	"Dermatology",
	"Orthopedics",
	"Pediatrics",
	"Psychiatry",
];

export function SearchHero() {
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

				<Card className="max-w-4xl mx-auto shadow-lg">
					<CardContent className="p-4 md:p-6">
						<div className="flex flex-col md:flex-row gap-4 items-end">
							<div className="flex-1 w-full">
								<label
									htmlFor="specialty-selector"
									className="text-sm font-medium text-slate-700 mb-2"
								>
									Especialidade
								</label>
								<div className="relative w-full h-12">
									<Select>
										<SelectTrigger
											id="specialty-selector"
											className="bg-white border-slate-300 w-full data-[size=default]:h-full"
										>
											<SelectValue placeholder="Selecione a especialidade" />
										</SelectTrigger>
										<SelectContent>
											{specialties.map((specialty) => (
												<SelectItem
													key={specialty}
													value={specialty.toLowerCase()}
												>
													{specialty}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex-1 w-full">
								<span className="block text-sm font-medium text-slate-700 mb-2">
									Cidade, Estado
								</span>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
									<Input
										type="text"
										placeholder="e.g.: Pouso Alegre, Minas Gerais"
										className="pl-10 h-12 bg-white border-slate-300"
									/>
								</div>
							</div>

							<Button
								size="lg"
								className="h-12 px-8 bg-primary text-white w-full md:w-auto"
							>
								Buscar
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
