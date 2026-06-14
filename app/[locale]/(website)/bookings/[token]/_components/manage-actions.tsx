"use client";

import { SlotPicker } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cancelBooking, rescheduleBooking } from "../_actions";

export function ManageActions({
	token,
	mentorSlug,
	initialWeekStart,
}: {
	token: string;
	mentorSlug: string;
	initialWeekStart: string | null;
}) {
	const router = useRouter();
	const [mode, setMode] = useState<"idle" | "cancel" | "reschedule">("idle");
	const [reason, setReason] = useState("");
	const [newStart, setNewStart] = useState<string | null>(null);

	const cancel = useAction(cancelBooking, {
		onSuccess: () => {
			toast.success("Cancelled");
			router.refresh();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
	});
	const reschedule = useAction(rescheduleBooking, {
		onSuccess: () => {
			toast.success("Rescheduled");
			router.refresh();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Failed"),
	});

	if (mode === "cancel") {
		return (
			<div className="space-y-3">
				<Textarea
					placeholder="Reason (optional)"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="border-red-300 text-red-700 hover:bg-red-50"
						onClick={() =>
							cancel.execute({ token, reason: reason || undefined })
						}
						disabled={cancel.isPending}
					>
						{cancel.isPending ? "Cancelling…" : "Confirm cancel"}
					</Button>
					<Button variant="ghost" onClick={() => setMode("idle")}>
						Back
					</Button>
				</div>
			</div>
		);
	}

	if (mode === "reschedule") {
		return (
			<div className="space-y-3">
				<SlotPicker
					mentorSlug={mentorSlug}
					initialWeekStart={initialWeekStart}
					selectedStartUtc={newStart}
					onSelect={setNewStart}
				/>
				<div className="flex gap-2">
					<Button
						disabled={!newStart || reschedule.isPending}
						onClick={() =>
							newStart && reschedule.execute({ token, newStartAtUtc: newStart })
						}
					>
						{reschedule.isPending ? "Rescheduling…" : "Confirm new time"}
					</Button>
					<Button variant="ghost" onClick={() => setMode("idle")}>
						Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex gap-2">
			<Button variant="outline" size="sm" onClick={() => setMode("reschedule")}>
				Reschedule
			</Button>
			<Button
				variant="outline"
				className="border-red-300 text-red-700 hover:bg-red-50 hover:text-black"
        onClick={() => setMode("cancel")}
				size="sm"
			>
				Cancel
			</Button>
		</div>
	);
}
