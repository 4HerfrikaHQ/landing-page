"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, UserX } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { type AdminBookingRow, setBookingOutcome } from "../_actions";

export function OutcomeButtons({ booking }: { booking: AdminBookingRow }) {
	const action = useAction(setBookingOutcome, {
		onSuccess: () => toast.success("Outcome updated."),
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't update the outcome."),
	});
	const overridden = Boolean(booking.outcome_set_by_admin_at);
	const set = (outcome: "completed" | "no_show" | "answers") =>
		action.execute({ bookingId: booking.id, outcome });

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground hover:bg-green-50 hover:text-green-700"
				disabled={
					action.isPending || (overridden && booking.status === "completed")
				}
				onClick={() => set("completed")}
			>
				<CheckCircle2 className="size-4" />
				Mark as completed
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground hover:bg-rose-50 hover:text-rose-700"
				disabled={
					action.isPending || (overridden && booking.status === "no_show")
				}
				onClick={() => set("no_show")}
			>
				<UserX className="size-4" />
				Mark as no-show
			</Button>
			{overridden ? (
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground"
					disabled={action.isPending}
					onClick={() => set("answers")}
				>
					<RotateCcw className="size-4" />
					Use their answers
				</Button>
			) : null}
		</div>
	);
}
