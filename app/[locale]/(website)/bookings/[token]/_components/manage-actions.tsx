"use client";

import { SlotPicker } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { CalendarClock, X } from "lucide-react";
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
			toast.success("Your booking has been cancelled");
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't cancel. Please try again."),
	});
	const reschedule = useAction(rescheduleBooking, {
		onSuccess: () => {
			toast.success("Your booking has been rescheduled");
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(
				error.serverError ?? "Couldn't reschedule. Please try again.",
			),
	});

	if (mode === "cancel") {
		return (
			<div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
				<h2 className="font-semibold text-foreground">Cancel this booking?</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Your mentor will be notified and the calendar invite removed. This
					can't be undone.
				</p>
				<Textarea
					className="mt-4 bg-white"
					placeholder="Reason (optional)"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
				<div className="mt-4 flex gap-3">
					<Button
						size="sm"
						className={cn(
							"bg-destructive text-destructive-foreground hover:brightness-90",
						)}
						onClick={() =>
							cancel.execute({ token, reason: reason || undefined })
						}
						disabled={cancel.isPending}
					>
						{cancel.isPending ? "Cancelling…" : "Yes, cancel booking"}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setMode("idle")}
						disabled={cancel.isPending}
					>
						Keep booking
					</Button>
				</div>
			</div>
		);
	}

	if (mode === "reschedule") {
		return (
			<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<h2 className="font-semibold text-foreground">Pick a new time</h2>
				<div className="mt-4">
					<SlotPicker
						mentorSlug={mentorSlug}
						initialWeekStart={initialWeekStart}
						selectedStartUtc={newStart}
						onSelect={setNewStart}
					/>
				</div>
				<div className="mt-4 flex gap-3">
					<Button
						size="sm"
						disabled={!newStart || reschedule.isPending}
						onClick={() =>
							newStart && reschedule.execute({ token, newStartAtUtc: newStart })
						}
					>
						{reschedule.isPending ? "Rescheduling…" : "Confirm new time"}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setMode("idle")}
						disabled={reschedule.isPending}
					>
						Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-3">
			<Button
				variant="outline"
				size="sm"
				className="inline-flex items-center gap-2"
				onClick={() => setMode("reschedule")}
			>
				<CalendarClock className="size-4" />
				Reschedule
			</Button>
			<Button
				size="sm"
				className="inline-flex items-center gap-2 border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
				onClick={() => setMode("cancel")}
			>
				<X className="size-4" />
				Cancel booking
			</Button>
		</div>
	);
}
