"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitFeedback } from "../_actions";
import { SubmitFeedbackSchema } from "../_schema";

export function FeedbackForm({ token }: { token: string }) {
	const router = useRouter();

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
					toast.success("Thanks for the feedback!");
					router.refresh();
				},
				onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
			},
		},
	);

	const happened = form.watch("call_happened");
	const rating = form.watch("rating");

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-5">
			<input type="hidden" {...form.register("token")} />

			<div className="space-y-1.5">
				<Label>Did the call happen?</Label>
				<select
					className="w-full rounded border px-2 py-1.5 bg-white"
					{...form.register("call_happened")}
				>
					<option value="yes">Yes</option>
					<option value="mentor_no_show">No — mentor didn't show</option>
					<option value="mentee_no_show">No — I didn't make it</option>
					<option value="rescheduled_externally">
						We rescheduled outside the platform
					</option>
				</select>
			</div>

			{happened === "yes" && (
				<div className="space-y-1.5">
					<Label>Rating (1–5)</Label>
					<div className="flex gap-2">
						{[1, 2, 3, 4, 5].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() =>
									form.setValue("rating", n, { shouldDirty: true })
								}
								className={`h-9 w-9 rounded border transition ${
									rating === n
										? "bg-primary text-primary-foreground border-primary"
										: "hover:bg-gray-50"
								}`}
							>
								{n}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="space-y-1.5">
				<Label>Anything else? (optional)</Label>
				<Textarea rows={4} {...form.register("comment")} />
			</div>

			<label className="flex items-start gap-2 text-sm">
				<input
					type="checkbox"
					{...form.register("testimonial_consent")}
					className="mt-0.5"
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
