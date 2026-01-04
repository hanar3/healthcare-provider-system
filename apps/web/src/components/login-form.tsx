import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const navigate = useNavigate();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (result.data) {
				navigate({
					to: "/dashboard",
				});
			}
		},
	});

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			{...props}
		>
			<div className="flex flex-col items-center gap-1 text-center">
				<h1 className="text-2xl font-bold">Login to your account</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<form.Field name="email">
				{(field) => (
					<>
						<FieldLabel htmlFor={field.name}>Email</FieldLabel>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							type="email"
							placeholder="m@example.com"
							required
						/>
					</>
				)}
			</form.Field>
			<form.Field name="password">
				{(field) => (
					<>
						<div className="flex items-center">
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<a
								href="#"
								className="ml-auto text-sm underline-offset-4 hover:underline"
							>
								Forgot your password?
							</a>
						</div>
						<Input
							id={field.name}
							name={field.name}
							onChange={(e) => field.handleChange(e.target.value)}
							type="password"
							required
						/>
					</>
				)}
			</form.Field>
			<form.Subscribe selector={(state) => [state.canSubmit]}>
				{([canSubmit]) => (
					<Button type="submit" disabled={!canSubmit}>
						Login
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
