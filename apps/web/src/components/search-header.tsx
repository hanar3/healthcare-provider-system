import { Stethoscope } from "lucide-react";
import { Button } from "./ui/button";

export function SearchHeader() {
	return (
		<header className="border-b border-slate-200">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Stethoscope className="h-6 w-6 text-blue-600" />
					<span className="text-xl font-semibold text-slate-800">
						HealthFind
					</span>
				</div>
				<Button variant="ghost" className="text-slate-600 hover:text-slate-800">
					For Companies / Login
				</Button>
			</div>
		</header>
	);
}
