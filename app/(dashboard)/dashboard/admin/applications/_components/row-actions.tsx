"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { approveMentorApplication, rejectMentorApplication } from "../_actions";

export function RowActions({
	applicationId,
	onDone,
}: {
	applicationId: string;
	/** Called after a successful approve/reject (e.g. to close a detail sheet). */
	onDone?: () => void;
}) {
	const [showReject, setShowReject] = useState(false);
	const [reason, setReason] = useState("");

	const approve = useAction(approveMentorApplication, {
		onSuccess: () => {
			toast.success("Approved. Onboarding email sent.");
			onDone?.();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
	});
	const reject = useAction(rejectMentorApplication, {
		onSuccess: () => {
			toast.success("Rejected.");
			setShowReject(false);
			onDone?.();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
	});

	if (showReject) {
		return (
			<div className="space-y-2">
				<Textarea
					placeholder="Optional message to applicant…"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						className="border-destructive/40 text-destructive hover:bg-destructive/5"
						onClick={() =>
							reject.execute({ applicationId, reason: reason || undefined })
						}
						disabled={reject.isPending}
					>
						Confirm reject
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setShowReject(false)}
					>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex gap-2">
			<Button
				onClick={() => approve.execute({ applicationId })}
				disabled={approve.isPending}
				size="sm"
			>
				{approve.isPending ? "Approving…" : "Approve"}
			</Button>
			<Button size="sm" variant="outline" onClick={() => setShowReject(true)}>
				Reject
			</Button>
		</div>
	);
}
