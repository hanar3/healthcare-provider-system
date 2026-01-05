import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import client, { type ClinicCreate } from "@/api";
import { clinicById, queryKeys } from "../-queries";
import { useState } from "react";

const schema = z.object({
	name: z
		.string()
		.min(5, "Nome/Razão social precisa ter pelo menos 5 caracteres"),
	address: z.string(),
	govId: z.string().optional(),
});

export function CreateClinicDialog({
	id,
	trigger,
}: {
	id?: string;
	trigger?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	const { data } = useQuery(clinicById(id));

	const { mutate: createClinic } = useMutation({
		mutationFn: async (payload: ClinicCreate) => {
			await client.clinics.post({
				...payload,
			});
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_CLINICS],
			});
		},
	});

	const { mutate: updateClinic } = useMutation({
		mutationFn: async (payload: Partial<ClinicCreate>) => {
			if (!id)
				throw new Error(
					"attempting to update without an ID, should be...impossible?",
				);
			await client.clinics({ id }).patch({
				...payload,
			});
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_CLINICS],
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: data?.name ?? "",
			address: data?.address ?? "",
			...(id ? { govId: data?.govId ?? "" } : {}),
		} satisfies z.infer<typeof schema>,
		validators: {
			onSubmit: schema,
		},
		onSubmit: ({ value }) => {
			if (!id) {
				createClinic({
					...value,
				});
			} else {
				updateClinic({
					...value,
				});
			}

			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				{!trigger ? (
					<Button className="flex gap-2 items-center bg-primary text-white p-2 rounded-md cursor-pointer text-sm">
						<Plus size="14px" className="text-sm" />
						Adicionar Clínica
					</Button>
				) : (
					trigger
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{id && data ? `Editar ${data.name}` : "Adicionar clínica"}
					</DialogTitle>
					<DialogDescription>
						{id && data
							? `Modifique as informações da clínica`
							: "Cadastre uma nova clinica no sistema"}
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Nome</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Clinica do Dr. João"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<FieldGroup>
						<form.Field
							name="address"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Endereço</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Rua 1, Numero 254, SP"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<FieldGroup>
						<form.Field
							name="govId"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>CNPJ</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											placeholder="00.000.000/0001-XX"
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<Button type="submit">{id ? "Salvar" : "Enviar"}</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
