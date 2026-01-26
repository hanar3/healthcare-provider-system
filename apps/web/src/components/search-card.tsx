import { IdCard, MapPin, Search } from "lucide-react";
import { Card, CardContent } from "./ui/card";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { doctorSpecialties } from "@/routes/dashboard/clinics/$clinicId/-queries";
import { SelectPills } from "./combobox";
import { useForm } from "@tanstack/react-form";

import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type ClinicSearchForm = {
	specialties: string[];
	address: string;
};

export function ClinicsSearchForm({
	onSearch,
	defaultValues,
}: {
	onSearch: (values: ClinicSearchForm) => void;
	defaultValues?: Partial<ClinicSearchForm>;
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
					<div className="relative w-full grid grid-cols-1 gap-4 sm:grid-cols-3">
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
											<FieldLabel htmlFor={field.name}>Localização</FieldLabel>

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
						<div className="flex items-end">
							<Button className="w-full h-10 px-8 bg-primary text-white font-bold">
								<Search />
								Buscar agora
							</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

type DoctorSearch = {
	specialties: string[];
	crm: string;
};

export function DoctorsSearch({
	onSearch,
	defaultValues,
}: {
	onSearch: (values: DoctorSearch) => void;
	defaultValues?: Partial<DoctorSearch>;
}) {
	const { data: specialties } = useSuspenseQuery(doctorSpecialties());
	const form = useForm({
		defaultValues: {
			specialties: defaultValues?.specialties ?? ([] as string[]),
			crm: defaultValues?.crm ?? "",
		} satisfies DoctorSearch,
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
					<div className="relative w-full grid grid-cols-1 gap-4 sm:grid-cols-3">
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
								name="crm"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>CRM</FieldLabel>

											<div className="relative">
												<IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
												<Input
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													type="text"
													placeholder="Exemplo: 123456/MG"
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
						<div className="flex items-end">
							<Button className="w-full h-10 px-8 bg-primary text-white font-bold">
								<Search />
								Buscar agora
							</Button>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

type Form = DoctorSearch | ClinicSearchForm;
export function SearchCard({
	onSearch,
	defaultValues,
}: {
	onSearch: (values: Form) => void;
	defaultValues?: Partial<Form>;
}) {
	return (
		<Tabs defaultValue="clinics" className="max-w-4xl mx-auto">
			<TabsList>
				<TabsTrigger value="clinics">Clínicas</TabsTrigger>
				<TabsTrigger value="doctors">Profissionais</TabsTrigger>
			</TabsList>
			<TabsContent value="clinics">
				<ClinicsSearchForm
					onSearch={onSearch}
					defaultValues={defaultValues as ClinicSearchForm}
				/>
			</TabsContent>
			<TabsContent value="doctors">
				<DoctorsSearch onSearch={onSearch} defaultValues={defaultValues} />
			</TabsContent>
		</Tabs>
	);
}
