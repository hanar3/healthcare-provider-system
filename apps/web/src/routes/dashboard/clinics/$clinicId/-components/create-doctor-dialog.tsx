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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import client, { type DoctorCreate } from "@/api";
import { doctorById, doctorSpecialties, queryKeys } from "../-queries";
import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { SelectPills } from "@/components/combobox";

const schema = z.object({
	name: z.string().min(1, "Nome é um campo obrigatório"),
	specialties: z.array(z.string()),
	govId: z.string(),
	email: z.string(),
});

export function CreateDoctorDialog({
	id,
	trigger,
}: {
	id?: string;
	trigger?: React.ReactNode;
}) {
	const { clinicId } = useParams({ from: "/dashboard/clinics/$clinicId" });
	const [open, setOpen] = useState(false);

	const { data: specialties } = useQuery(doctorSpecialties());
	const { data } = useQuery({
		...doctorById(id),
		enabled: !!id && open,
	});

	const { mutate: createDoctor } = useMutation({
		mutationFn: async (payload: DoctorCreate) => {
			const res = await client.doctors.post({
				clinicId,
				name: payload.name,
				email: payload.email,
				specialties: payload.specialties,
			});
			if (res.status === 409) throw new Error("O email já existe");
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_DOCTORS],
			});
			setOpen(false);
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const { mutate: updateDoctor } = useMutation({
		mutationFn: async (payload: Partial<DoctorCreate>) => {
			if (!id)
				throw new Error(
					"attempting to update without an ID, should be...impossible?",
				);
			const res = await client.doctors({ id }).patch({
				...payload,
			});

			if (res.status === 409) throw new Error("O email já existe");
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_DOCTORS],
			});
			setOpen(false);
		},
	});

	const form = useForm({
		defaultValues: {
			name: data?.name ?? "",
			govId: data?.govId ?? "",
			email: data?.email ?? "",
			specialties: data?.specialties.map((s) => s.id) ?? [],
		} satisfies z.infer<typeof schema>,
		validators: {
			onSubmit: schema,
		},
		onSubmit: ({ value }) => {
			if (!id) {
				createDoctor({
					...value,
				});
			} else {
				updateDoctor({
					...value,
				});
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				{!trigger ? (
					<Button className="flex gap-2 items-center bg-primary text-white p-2 rounded-md cursor-pointer text-sm">
						<Plus size="14px" className="text-sm" />
						Adicionar Médico
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
							? `Modifique as informações do médico`
							: "Cadastre um novo médico no sistema"}
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
											placeholder="Dr. João"
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
							name="email"
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
											placeholder="a@a.com"
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
										<FieldLabel htmlFor={field.name}>CRM</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											placeholder="123456/SP"
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
					<FieldGroup>
						<form.Field
							name="specialties"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Especialidades</FieldLabel>
										<SelectPills
											placeholder="Selecione as especialidades"
											data={
												specialties?.map((s) => ({
													value: s.id,
													name: s.name,
												})) ?? []
											}
											value={field.state.value}
											onValueChange={field.handleChange}
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
