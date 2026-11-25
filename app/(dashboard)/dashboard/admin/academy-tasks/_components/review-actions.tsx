"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { reviewTaskSubmission } from "../_actions";
import { NOTE_MAX_LENGTH } from "../_helpers";

type Step = "writing" | "confirming_complete";

export function ReviewActions({
	submissionId,
	onDone,
}: {
	submissionId: string;
	onDone: () => void;
}) {
	const [note, setNote] = useState("");
	const [step, setStep] = useState<Step>("writing");

	const review = useAction(reviewTaskSubmission, {
		onSuccess: ({ data }) => {
			if (data.decision === "needs_work") {
				toast.success("Sent back to the learner with your note.");
			} else if (data.certificateIssued) {
				toast.success(
					"Marked complete. Course finished and certificate issued.",
				);
			} else if (data.courseCompleted) {
				toast.success("Marked complete. Course finished.");
			} else {
				toast.success("Marked complete.");
			}
			onDone();
		},
		onError: ({ error }) => {
			setStep("writing");
			toast.error(error.serverError ?? "Could not save the review");
		},
	});

	const hasNote = note.trim().length > 0;

	return (
		<div className="space-y-3">
			<div className="space-y-1.5">
				<label
					htmlFor={`note-${submissionId}`}
					className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
				>
					Note to the learner
				</label>
				<Textarea
					id={`note-${submissionId}`}
					placeholder="Required for Needs work. Optional when marking complete."
					value={note}
					maxLength={NOTE_MAX_LENGTH}
					onChange={(event) => setNote(event.target.value)}
					disabled={review.isPending}
				/>
				<p className="text-right text-xs text-muted-foreground">
					{note.length}/{NOTE_MAX_LENGTH}
				</p>
			</div>

			{step === "confirming_complete" ? (
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">
						This finishes the task. If it is the learner's last requirement,
						their course completes and the certificate is issued.
					</p>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={() =>
								review.execute({ submissionId, decision: "complete", note })
							}
							disabled={review.isPending}
						>
							{review.isPending ? "Saving…" : "Confirm complete"}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setStep("writing")}
							disabled={review.isPending}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<div className="flex gap-2">
					<Button size="sm" onClick={() => setStep("confirming_complete")}>
						Mark complete
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							review.execute({ submissionId, decision: "needs_work", note })
						}
						disabled={!hasNote || review.isPending}
					>
						{review.isPending ? "Saving…" : "Needs work"}
					</Button>
				</div>
			)}
		</div>
	);
}
