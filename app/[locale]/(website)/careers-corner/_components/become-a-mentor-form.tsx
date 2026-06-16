"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon } from "lucide-react";
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
				// No onSuccess needed: when the action succeeds we swap the form for the
				// confirmation panel below (driven by `action.hasSucceeded`), so the form
				// unmounts and there is nothing to reset.
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Something went wrong. Try again."),
			},
		},
	);

	const errors = form.formState.errors;

	if (action.hasSucceeded) {
		return (
			<EmptyState
				className="border-solid bg-surface-pink/40"
				icon={CheckCircle2Icon}
				title="Application received — here's what happens next"
				description="Our team reviews each application personally and gets back to you within a few days. If it's a match, we'll send you a link to set up your mentor profile and availability."
				action={
					<Button href="/careers-corner" variant="outline" size="sm">
						Back to mentors
					</Button>
				}
			/>
		);
	}

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-10">
			<Section
				title="Contact"
				description="So we know who you are and how to reach you."
			>
				<FormField label="Full name" error={errors.name?.message}>
					<Input {...form.register("name")} />
				</FormField>

				<FormField label="Email" error={errors.email?.message}>
					<Input type="email" {...form.register("email")} />
				</FormField>

				<FormField
					label="Phone / WhatsApp"
					hint="Optional"
					helper="Only used if we need to follow up directly."
				>
					<Input {...form.register("phone")} />
				</FormField>

				<FormField label="Country" hint="Optional">
					<Input {...form.register("country")} />
				</FormField>
			</Section>

			<Section
				title="About you"
				description="A snapshot of your work so mentees know who they'll meet."
			>
				<FormField
					label="Position / role"
					error={errors.position?.message}
					helper="Your current title and where you work."
				>
					<Input
						placeholder="e.g. Senior PM at Stripe"
						{...form.register("position")}
					/>
				</FormField>

				<FormField label="LinkedIn URL" hint="Optional">
					<Input type="url" {...form.register("linkedin_url")} />
				</FormField>

				<FormField
					label="Short bio"
					hint="Optional"
					helper="A few sentences on your background and what you love to talk about."
				>
					<Textarea rows={3} {...form.register("bio")} />
				</FormField>
			</Section>

			<Section
				title="Motivation"
				description="Help us understand why mentoring matters to you."
			>
				<FormField
					label="Why do you want to mentor?"
					error={errors.motivation?.message}
					helper="Share what draws you to supporting young African women in tech and business."
				>
					<Textarea rows={5} {...form.register("motivation")} />
				</FormField>
			</Section>

			<Button
				type="submit"
				disabled={action.isPending}
				className="w-full"
				size="lg"
			>
				{action.isPending ? "Submitting…" : "Submit application"}
			</Button>
		</form>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-5">
			<div className="space-y-1">
				<h2 className="font-heading text-base font-semibold text-foreground">
					{title}
				</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="space-y-5">{children}</div>
		</section>
	);
}

function FormField({
	label,
	hint,
	helper,
	error,
	children,
}: {
	label: string;
	hint?: string;
	helper?: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-baseline justify-between gap-2">
				<Label>{label}</Label>
				{hint ? (
					<span className="text-xs text-muted-foreground">{hint}</span>
				) : null}
			</div>
			{children}
			{helper && !error ? (
				<p className="text-xs text-muted-foreground">{helper}</p>
			) : null}
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
