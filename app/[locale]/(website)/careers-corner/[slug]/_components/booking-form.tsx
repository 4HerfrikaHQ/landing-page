"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";

/** Loose RHF field-error shape (covers FieldError and nested Merge variants). */
type RhfError = { message?: unknown } | string | undefined;

function errorMessage(error: RhfError): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	return typeof error.message === "string" ? error.message : undefined;
}
import type { ReactNode } from "react";
import { toast } from "sonner";
import { createBooking } from "../_actions";
import { CreateBookingSchema } from "../_schema";

const GENDER_OPTIONS = [
	{ value: "female", label: "Female" },
	{ value: "male", label: "Male" },
	{ value: "non_binary", label: "Non-binary" },
	{ value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const CAREER_STAGE_OPTIONS = [
	{ value: "student", label: "Student" },
	{ value: "early_career", label: "Early career" },
	{ value: "mid_career", label: "Mid career" },
	{ value: "founder", label: "Founder" },
	{ value: "other", label: "Other" },
] as const;

export function BookingForm({
	mentorSlug,
	mentorName,
	whenLabel,
	startAtUtc,
	menteeTimezone,
	onSuccess,
}: {
	mentorSlug: string;
	mentorName?: string;
	whenLabel?: string;
	startAtUtc: string;
	menteeTimezone: string;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		createBooking,
		zodResolver(CreateBookingSchema),
		{
			formProps: {
				defaultValues: {
					mentorSlug,
					startAtUtc,
					menteeTimezone,
					mentee_name: "",
					mentee_email: "",
					mentee_gender: "female",
					purpose: "",
					mentee_phone: "",
					mentee_linkedin: "",
					mentee_country: "",
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success("Booked. Check your email for the calendar invite.");
					queryClient.invalidateQueries({ queryKey: ["slots", mentorSlug] });
					onSuccess();
				},
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Couldn't book. Please try again."),
			},
		},
	);

	const errors = form.formState.errors;

	return (
		<form onSubmit={handleSubmitWithAction} className="flex h-full flex-col">
			<input type="hidden" {...form.register("mentorSlug")} />
			<input type="hidden" {...form.register("startAtUtc")} />
			<input type="hidden" {...form.register("menteeTimezone")} />

			<div className="flex-1 space-y-7 pb-4">
				{(mentorName || whenLabel) && (
					<div className="flex items-start gap-3 rounded-2xl border border-primary-500/20 bg-surface-pink px-4 py-3">
						<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
							<CalendarClock className="size-5" />
						</span>
						<div className="text-sm">
							{mentorName && (
								<p className="font-semibold text-foreground">
									30-min call with {mentorName}
								</p>
							)}
							{whenLabel && (
								<p className="text-muted-foreground">{whenLabel}</p>
							)}
						</div>
					</div>
				)}

				<Section title="About you">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field label="Name" error={errors.mentee_name}>
							<Input {...form.register("mentee_name")} />
						</Field>
						<Field label="Email" error={errors.mentee_email}>
							<Input type="email" {...form.register("mentee_email")} />
						</Field>
						<Field label="Gender">
							<Select
								value={form.watch("mentee_gender")}
								onValueChange={(v) =>
									v &&
									form.setValue(
										"mentee_gender",
										v as (typeof GENDER_OPTIONS)[number]["value"],
										{ shouldDirty: true },
									)
								}
							>
								<SelectTrigger className="h-10 w-full rounded-lg bg-white">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{GENDER_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field label="Country (optional)">
							<Input {...form.register("mentee_country")} />
						</Field>
					</div>
				</Section>

				<Section title="Your context">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field label="Career stage (optional)">
							<Select
								value={form.watch("mentee_career_stage") ?? ""}
								onValueChange={(v) =>
									form.setValue(
										"mentee_career_stage",
										(v || undefined) as
											| (typeof CAREER_STAGE_OPTIONS)[number]["value"]
											| undefined,
										{ shouldDirty: true },
									)
								}
							>
								<SelectTrigger className="h-10 w-full rounded-lg bg-white">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{CAREER_STAGE_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field label="Phone / WhatsApp (optional)">
							<Input {...form.register("mentee_phone")} />
						</Field>
						<div className="md:col-span-2">
							<Field label="LinkedIn / portfolio URL (optional)">
								<Input type="url" {...form.register("mentee_linkedin")} />
							</Field>
						</div>
					</div>
				</Section>

				<Section title="What to discuss">
					<Field label="What do you want to discuss?" error={errors.purpose}>
						<Textarea
							rows={4}
							placeholder="Share a few notes so your mentor can prepare."
							{...form.register("purpose")}
						/>
					</Field>
				</Section>
			</div>

			<div className="sticky bottom-0 -mx-4 border-t border-border/60 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
				<Button type="submit" disabled={action.isPending} className="w-full">
					{action.isPending ? "Booking…" : "Confirm booking"}
				</Button>
			</div>
		</form>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-3">
			<h3 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
				{title}
			</h3>
			{children}
		</div>
	);
}

function Field({
	label,
	error,
	children,
}: {
	label: string;
	error?: RhfError;
	children: ReactNode;
}) {
	const message = errorMessage(error);
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
			{message && <p className="text-xs text-destructive">{message}</p>}
		</div>
	);
}
