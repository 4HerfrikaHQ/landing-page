"use client";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { submitFeedback } from "../_actions";
import { SubmitFeedbackSchema } from "../_schema";

const CALL_OPTIONS = [
	{ value: "yes", label: "Yes" },
	{ value: "mentor_no_show", label: "No — mentor didn't show" },
	{ value: "mentee_no_show", label: "No — I didn't make it" },
	{
		value: "rescheduled_externally",
		label: "We rescheduled outside the platform",
	},
] as const;

export function FeedbackForm({ token }: { token: string }) {
	const router = useRouter();
	const [hovered, setHovered] = useState(0);

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		submitFeedback,
		zodResolver(SubmitFeedbackSchema),
		{
			formProps: {
				defaultValues: {
					token,
					call_happened: "yes",
					rating: 5,
					comment: "",
					testimonial_consent: false,
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success("Thanks for your feedback");
					router.refresh();
				},
				onError: ({ error }) =>
					toast.error(
						error.serverError ?? "Couldn't submit. Please try again.",
					),
			},
		},
	);

	const happened = form.watch("call_happened");
	const rating = form.watch("rating") ?? 0;

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-6">
			<input type="hidden" {...form.register("token")} />

			<div className="space-y-1.5">
				<Label>Did the call happen?</Label>
				<Select
					value={form.watch("call_happened")}
					onValueChange={(v) =>
						v &&
						form.setValue(
							"call_happened",
							v as (typeof CALL_OPTIONS)[number]["value"],
							{ shouldDirty: true },
						)
					}
				>
					<SelectTrigger className="h-10 w-full rounded-lg bg-white">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
					<SelectContent>
						{CALL_OPTIONS.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{happened === "yes" && (
				<div className="space-y-2">
					<Label>How would you rate it?</Label>
					<div className="flex items-center gap-1.5">
						{[1, 2, 3, 4, 5].map((n) => {
							const active = (hovered || rating) >= n;
							return (
								<button
									key={n}
									type="button"
									aria-label={`${n} star${n > 1 ? "s" : ""}`}
									onMouseEnter={() => setHovered(n)}
									onMouseLeave={() => setHovered(0)}
									onClick={() =>
										form.setValue("rating", n, { shouldDirty: true })
									}
									className="flex size-11 items-center justify-center rounded-xl transition-transform hover:scale-110 active:scale-95"
								>
									<Star
										className={cn(
											"size-8 transition-colors",
											active
												? "fill-primary-500 text-primary-500"
												: "text-border",
										)}
									/>
								</button>
							);
						})}
					</div>
				</div>
			)}

			<div className="space-y-1.5">
				<Label>Anything else? (optional)</Label>
				<Textarea
					rows={4}
					placeholder="Share what went well or how we could improve."
					{...form.register("comment")}
				/>
			</div>

			<label className="flex items-start gap-2.5 text-sm text-foreground/80">
				<input
					type="checkbox"
					{...form.register("testimonial_consent")}
					className="mt-0.5 size-4 accent-primary-500"
				/>
				<span>
					Allow 4HerFrika to share my comment publicly as a testimonial.
				</span>
			</label>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? "Submitting…" : "Submit feedback"}
			</Button>
		</form>
	);
}
