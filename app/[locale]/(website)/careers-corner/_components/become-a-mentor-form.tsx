"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import { submitMentorApplication } from "../apply/_actions";
import { SubmitApplicationSchema } from "../apply/_schema";

export function BecomeAMentorForm() {
	const { form, handleSubmitWithAction, action } = useHookFormAction(
		submitMentorApplication,
		zodResolver(SubmitApplicationSchema),
		{
			formProps: {
				defaultValues: {
					name: "",
					email: "",
					phone: "",
					linkedin_url: "",
					country: "",
					position: "",
					bio: "",
					expertise_areas: [],
					motivation: "",
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success("Application received. We will be in touch.");
					form.reset();
				},
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Failed to submit."),
			},
		},
	);

	const errors = form.formState.errors;

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-5">
			<FormField label="Full name" error={errors.name?.message}>
				<Input {...form.register("name")} />
			</FormField>

			<FormField label="Email" error={errors.email?.message}>
				<Input type="email" {...form.register("email")} />
			</FormField>

			<FormField label="Position / role" error={errors.position?.message}>
				<Input
					placeholder="e.g. Senior PM at Stripe"
					{...form.register("position")}
				/>
			</FormField>

			<FormField label="LinkedIn URL (optional)">
				<Input type="url" {...form.register("linkedin_url")} />
			</FormField>

			<FormField label="Phone / WhatsApp (optional)">
				<Input {...form.register("phone")} />
			</FormField>

			<FormField label="Country (optional)">
				<Input {...form.register("country")} />
			</FormField>

			<FormField label="Short bio (optional)">
				<Textarea rows={3} {...form.register("bio")} />
			</FormField>

			<FormField
				label="Why do you want to mentor?"
				error={errors.motivation?.message}
			>
				<Textarea rows={5} {...form.register("motivation")} />
			</FormField>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? "Submitting…" : "Submit application"}
			</Button>
		</form>
	);
}

function FormField({
	label,
	error,
	children,
}: {
	label: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
