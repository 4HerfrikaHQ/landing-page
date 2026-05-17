"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createBooking } from "../_actions";
import { CreateBookingSchema } from "../_schema";

export function BookingForm({
	mentorSlug,
	startAtUtc,
	menteeTimezone,
	onSuccess,
}: {
	mentorSlug: string;
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
					toast.success(
						"Booked! Check your email for the calendar invite.",
					);
					queryClient.invalidateQueries({ queryKey: ["slots", mentorSlug] });
					onSuccess();
				},
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Failed to book."),
			},
		},
	);

	const errors = form.formState.errors;

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-4">
			<input type="hidden" {...form.register("mentorSlug")} />
			<input type="hidden" {...form.register("startAtUtc")} />
			<input type="hidden" {...form.register("menteeTimezone")} />

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<Field label="Name" error={errors.mentee_name?.message}>
					<Input {...form.register("mentee_name")} />
				</Field>
				<Field label="Email" error={errors.mentee_email?.message}>
					<Input type="email" {...form.register("mentee_email")} />
				</Field>
				<Field label="Gender">
					<select
						className="w-full rounded border px-2 py-1.5 bg-white"
						{...form.register("mentee_gender")}
					>
						<option value="female">Female</option>
						<option value="male">Male</option>
						<option value="non_binary">Non-binary</option>
						<option value="prefer_not_to_say">Prefer not to say</option>
					</select>
				</Field>
				<Field label="Career stage (optional)">
					<select
						className="w-full rounded border px-2 py-1.5 bg-white"
						{...form.register("mentee_career_stage")}
					>
						<option value="">—</option>
						<option value="student">Student</option>
						<option value="early_career">Early career</option>
						<option value="mid_career">Mid career</option>
						<option value="founder">Founder</option>
						<option value="other">Other</option>
					</select>
				</Field>
				<Field label="Country (optional)">
					<Input {...form.register("mentee_country")} />
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

			<Field
				label="What do you want to discuss?"
				error={errors.purpose?.message}
			>
				<Textarea rows={4} {...form.register("purpose")} />
			</Field>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? "Booking…" : "Confirm booking"}
			</Button>
		</form>
	);
}

function Field({
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
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
