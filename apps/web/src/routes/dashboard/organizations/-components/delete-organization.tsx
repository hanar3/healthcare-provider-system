import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import client, { type OrganizationCreate } from "@/api";
import { queryKeys } from "../-queries";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export function DeleteOrganizationDialog({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const { mutate: deleteOrganization } = useMutation({
		mutationFn: async () => {
			await client.organizations({ id }).delete();
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_ORGANIZATIONS],
			});
			setOpen(false);
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger className="text-start w-full h-full">
				Excluir
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Confirmar ação</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação excluirá permanentemente essa empresa, tem certeza?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={() => deleteOrganization()}>
						Continuar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
