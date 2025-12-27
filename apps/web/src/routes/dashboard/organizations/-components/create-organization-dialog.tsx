import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "@tanstack/react-form";

export function CreateOrganizationDialog() {
	const form = useForm();
	return (
		<Dialog>
			<DialogTrigger className="flex gap-2 items-center bg-primary text-white p-2 rounded-md cursor-pointer text-sm">
				<Plus size="14px" className="text-sm" />
				Adicionar Empresa
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Adicionar empresa</DialogTitle>
					<DialogDescription>
						Cadastre uma nova empresa no sistema
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
