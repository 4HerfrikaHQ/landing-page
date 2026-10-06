"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { confirmAttendance } from "../_actions";

export function AttendanceForm({ token }: { token: string }) {
	const confirm = useAction(confirmAttendance, {
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't save. Please try again."),
	});

	if (confirm.hasSucceeded) {
		return (
			<EmptyState
				icon={CheckCircle2}
				title="Thanks, we've recorded that"
				description="You can see all your sessions in your dashboard."
			/>
		);
	}

	return (
		<div className="flex flex-col gap-3 sm:flex-row">
			<Button
				className="flex-1"
				onClick={() => confirm.execute({ token, attended: true })}
				disabled={confirm.isPending}
			>
				Yes, they joined
			</Button>
			<Button
				variant="outline"
				className="flex-1"
				onClick={() => confirm.execute({ token, attended: false })}
				disabled={confirm.isPending}
			>
				No, they didn't show
			</Button>
		</div>
	);
}
