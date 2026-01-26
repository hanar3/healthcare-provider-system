import { MapPin, Search } from "lucide-react";
import { Card, CardContent } from "./ui/card";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { doctorSpecialties } from "@/routes/dashboard/clinics/$clinicId/-queries";
import { SelectPills } from "./combobox";
import { useForm } from "@tanstack/react-form";

import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

type Form = {
	specialties: string[];
	address: string;
};
export function SearchCard({
	onSearch,
	defaultValues,
}: {
	onSearch: (values: Form) => void;
	defaultValues?: Partial<Form>;
}) {
	const { data: specialties } = useSuspenseQuery(doctorSpecialties());
	const form = useForm({
		defaultValues: {
			specialties: defaultValues?.specialties ?? ([] as string[]),
			address: defaultValues?.address ?? "",
		} satisfies Form,
		onSubmit: ({ value }) => {
			onSearch(value);
		},
	});
	return (
		<Card className="max-w-4xl mx-auto shadow-lg">
			<CardContent className="p-4 md:p-6">
				<form
					className="flex flex-col md:flex-row gap-4 items-center"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="flex-1 w-full">
						<div className="relative flex w-full gap-4">
							<FieldGroup>
								<form.Field
									name="specialties"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Especialidades
												</FieldLabel>
												<SelectPills
													placeholder="Selecione as especialidades"
													data={
														specialties?.map((s) => ({
															value: s.slug,
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
							<FieldGroup>
								<form.Field
									name="address"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Localização
												</FieldLabel>

												<div className="relative">
													<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
													<Input
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														type="text"
														placeholder="Exemplo: Pouso Alegre, Minas Gerais"
														className="pl-10 h-10 bg-white border-slate-300"
													/>
												</div>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldGroup>
						</div>
					</div>

					<Button className="h-10 px-8 bg-primary text-white w-full md:w-auto font-bold">
						<Search />
						Buscar agora
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
