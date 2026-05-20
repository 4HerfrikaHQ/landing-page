"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	approveMentorApplication,
	rejectMentorApplication,
} from "../_actions";

export function RowActions({ applicationId }: { applicationId: string }) {
	const router = useRouter();
	const [showReject, setShowReject] = useState(false);
	const [reason, setReason] = useState("");

	const approve = useAction(approveMentorApplication, {
		onSuccess: () => {
			toast.success("Approved. Onboarding email sent.");
			router.refresh();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
	});
	const reject = useAction(rejectMentorApplication, {
		onSuccess: () => {
			toast.success("Rejected.");
			setShowReject(false);
			router.refresh();
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
						variant="outline"
						className="border-red-300 text-red-700 hover:bg-red-50"
						onClick={() =>
							reject.execute({ applicationId, reason: reason || undefined })
						}
						disabled={reject.isPending}
					>
						Confirm reject
					</Button>
					<Button variant="ghost" onClick={() => setShowReject(false)}>
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
			>
				{approve.isPending ? "Approving…" : "Approve"}
			</Button>
			<Button variant="outline" onClick={() => setShowReject(true)}>
				Reject
			</Button>
		</div>
	);
}
