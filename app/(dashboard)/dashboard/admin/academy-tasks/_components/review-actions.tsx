"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { reviewTaskSubmission } from "../_actions";
import {
	NOTE_MAX_LENGTH,
	type ReviewDecision,
	type ReviewStep,
	reviewDecision,
	reviewStep,
} from "../_schema";

type ReviewOutcome = {
	decision: ReviewDecision;
	courseCompleted: boolean;
	certificateIssued: boolean;
};

function successMessage(outcome: ReviewOutcome) {
	if (outcome.decision === reviewDecision.enum.needs_work) {
		return "Sent back to the learner with your note.";
	}
	if (outcome.certificateIssued) {
		return "Marked complete. Course finished and certificate issued.";
	}
	if (outcome.courseCompleted) return "Marked complete. Course finished.";
	return "Marked complete.";
}

export function ReviewActions({
	submissionId,
	onDone,
}: {
	submissionId: string;
	onDone: () => void;
}) {
	const [note, setNote] = useState("");
	const [step, setStep] = useState<ReviewStep>(reviewStep.enum.writing);

	const review = useAction(reviewTaskSubmission, {
		onSuccess: ({ data }) => {
			toast.success(successMessage(data));
			onDone();
		},
		onError: ({ error }) => {
			setStep(reviewStep.enum.writing);
			toast.error(error.serverError ?? "Could not save the review");
		},
	});

	const submit = (decision: ReviewDecision) =>
		review.execute({ submissionId, decision, note });
	const savingLabel = "Saving…";

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

			<ReviewButtons
				step={step}
				pending={review.isPending}
				hasNote={note.trim().length > 0}
				savingLabel={savingLabel}
				onAskConfirm={() => setStep(reviewStep.enum.confirming_complete)}
				onCancel={() => setStep(reviewStep.enum.writing)}
				onSubmit={submit}
			/>
		</div>
	);
}

type ReviewButtonsProps = {
	step: ReviewStep;
	pending: boolean;
	hasNote: boolean;
	savingLabel: string;
	onAskConfirm: () => void;
	onCancel: () => void;
	onSubmit: (decision: ReviewDecision) => void;
};

function ReviewButtons(props: ReviewButtonsProps) {
	if (props.step === reviewStep.enum.confirming_complete) {
		return <ConfirmComplete {...props} />;
	}
	return <WritingButtons {...props} />;
}

function ConfirmComplete({
	pending,
	savingLabel,
	onCancel,
	onSubmit,
}: ReviewButtonsProps) {
	const confirmLabel = pending ? savingLabel : "Confirm complete";
	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				This finishes the task. If it is the learner's last requirement, their
				course completes and the certificate is issued.
			</p>
			<div className="flex gap-2">
				<Button
					size="sm"
					onClick={() => onSubmit(reviewDecision.enum.complete)}
					disabled={pending}
				>
					{confirmLabel}
				</Button>
				<Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
					Cancel
				</Button>
			</div>
		</div>
	);
}

function WritingButtons({
	pending,
	hasNote,
	savingLabel,
	onAskConfirm,
	onSubmit,
}: ReviewButtonsProps) {
	const needsWorkLabel = pending ? savingLabel : "Needs work";
	return (
		<div className="flex gap-2">
			<Button size="sm" onClick={onAskConfirm}>
				Mark complete
			</Button>
			<Button
				size="sm"
				variant="outline"
				onClick={() => onSubmit(reviewDecision.enum.needs_work)}
				disabled={!hasNote || pending}
			>
				{needsWorkLabel}
			</Button>
		</div>
	);
}
