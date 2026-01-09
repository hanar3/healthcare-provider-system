import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type DoctorCardProps = {
	name: string;
	status: "active" | "suspended";
	specialties: string[];
	govId: string;
};

export function DoctorCard({
	name,
	specialties,
	status,
	govId,
}: DoctorCardProps) {
	return (
		<div className="border border-border rounded-lg bg-card p-6 space-y-4">
			<div className="flex items-start gap-4">
				<Avatar className="h-12 w-12">
					<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
						{name
							.split(" ")
							.map((n) => n[0])
							.join("")}
					</AvatarFallback>
				</Avatar>
				<div className="flex-col flex-1 min-w-0">
					<h3 className="text-base font-semibold text-foreground">{name}</h3>
					<div className="grid grid-rows-3 mt-2 gap-2">
						{specialties.map((specialty) => (
							<Badge key={specialty} variant="secondary">
								{specialty}
							</Badge>
						))}
					</div>
				</div>
			</div>

			<div>
				<p className="text-xs text-muted-foreground">CRM</p>
				<p className="text-sm text-foreground font-medium">{govId}</p>
			</div>

			<div className="flex items-center justify-between pt-2 border-t border-border">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-foreground">
						{status === "active" ? "Disponível" : "Indisponível"}
					</span>
				</div>
				<Switch
					checked={true}
				// onCheckedChange={() => toggleAvailability(id)}
				/>
			</div>

			<Button variant="destructive" className="w-full" size="sm">
				Remover da clínica
			</Button>
		</div>
	);
}
