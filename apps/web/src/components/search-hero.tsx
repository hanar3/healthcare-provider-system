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
		<section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-8 text-balance">
					Find the right care, right now.
				</h1>

				<Card className="max-w-4xl mx-auto shadow-lg">
					<CardContent className="p-6 md:p-8">
						<div className="flex flex-col md:flex-row gap-4 items-end">
							<div className="flex-1 w-full">
								<label
									htmlFor="specialty-selector"
									className="text-sm font-medium text-slate-700 mb-2"
								>
									Specialty
								</label>
								<div className="relative w-full h-12">
									<Select>
										<SelectTrigger
											id="specialty-selector"
											className="bg-white border-slate-300 w-full data-[size=default]:h-full"
										>
											<SelectValue placeholder="Select a specialty" />
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
									City / Location
								</span>
								<div className="relative">
									<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
									<Input
										type="text"
										placeholder="Enter city or zip code"
										className="pl-10 h-12 bg-white border-slate-300"
									/>
								</div>
							</div>

							<Button
								size="lg"
								className="h-12 px-8 bg-primary text-white w-full md:w-auto"
							>
								Search
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
