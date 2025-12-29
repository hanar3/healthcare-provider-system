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
	FieldDescription,
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
import { useMutation } from "@tanstack/react-query";
import client, { BeneficiaryCreate, type OrganizationCreate } from "@/api";
import { queryKeys } from "../-queries";
import { useState } from "react";
import { useParams } from "@tanstack/react-router";

const schema = z.object({
	name: z.string(),
	email: z.string(),
	plan: z.number(),
	govId: z.string(),
});

export function CreateBeneficiaryDialog() {
	const { organizationId } = useParams({
		from: "/dashboard/organizations/$organizationId",
	});

	const [open, setOpen] = useState(false);

	const { mutate: createBeneficiary } = useMutation({
		mutationFn: async (payload: BeneficiaryCreate) => {
			await client.beneficiaries.post({
				...payload,
				organizationId,
			});
		},
		onSuccess: (_data, _variables, _onMutateResult, context) => {
			context.client.invalidateQueries({
				queryKey: [queryKeys.LIST_BENEFICIARIES],
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			plan: 0,
			govId: "",
		},
		validators: {
			onSubmit: schema,
		},
		onSubmit: ({ value }) => {
			createBeneficiary(value);
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="flex gap-2 items-center bg-primary text-white p-2 rounded-md cursor-pointer text-sm">
				<Plus size="14px" className="text-sm" />
				Adicionar Beneficiário
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Adicionar beneficiário</DialogTitle>
					<DialogDescription>
						Cadastre uma novo beneficiário no sistema
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
										<FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Vitor Silva"
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
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											type="email"
											placeholder="vitor.silva@gmail.com"
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
										<FieldLabel htmlFor={field.name}>RG ou CPF</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											placeholder="00.000.000-X / 000.000.000-XX"
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
							name="plan"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Plano</FieldLabel>
										<Select
											value={String(field.state.value)}
											onValueChange={(value) =>
												field.handleChange(Number(value))
											}
										>
											<SelectTrigger
												className="w-[180px]"
												id={field.name}
												value={String(field.state.value)}
											>
												<SelectValue placeholder="Selecione um valor" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Plano da empresa</SelectLabel>
													<SelectItem value="0">Prata</SelectItem>
													<SelectItem value="1">Ouro</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
					<Button type="submit">Enviar</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
