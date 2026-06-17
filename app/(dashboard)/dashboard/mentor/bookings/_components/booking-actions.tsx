"use client";

import { SlotPicker } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
	RESCHEDULE_MIN_NOTICE_HOURS,
	canReschedule,
} from "@/src/lib/booking-rules";
import { CalendarClock, UserX, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	cancelMyBooking,
	markMyBookingNoShow,
	rescheduleMyBooking,
} from "../_actions";

export function BookingActions({
	bookingId,
	mentorSlug,
	startAtUtc,
	status,
	isUpcoming,
}: {
	bookingId: string;
	mentorSlug: string;
	startAtUtc: string;
	status: string;
	isUpcoming: boolean;
}) {
	const router = useRouter();
	const [rescheduleOpen, setRescheduleOpen] = useState(false);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [reason, setReason] = useState("");

	const reschedulable = canReschedule(new Date(startAtUtc).getTime(), Date.now());

	const reschedule = useAction(rescheduleMyBooking, {
		onSuccess: () => {
			toast.success("Rescheduled. The mentee has been emailed.");
			setRescheduleOpen(false);
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't reschedule."),
	});
	const cancel = useAction(cancelMyBooking, {
		onSuccess: () => {
			toast.success("Cancelled. The mentee has been emailed.");
			setCancelOpen(false);
			router.refresh();
		},
		onError: ({ error }) => toast.error(error.serverError ?? "Couldn't cancel."),
	});
	const noShow = useAction(markMyBookingNoShow, {
		onSuccess: () => {
			toast.success("Marked as no-show.");
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't mark no-show."),
	});

	// Past sessions: offer "mark no-show" unless already resolved that way / cancelled.
	if (!isUpcoming) {
		if (status === "no_show" || status === "cancelled") return null;
		return (
			<Button
				variant="outline"
				size="sm"
				disabled={noShow.isPending}
				onClick={() => noShow.execute({ bookingId })}
			>
				<UserX className="size-4" />
				Mark no-show
			</Button>
		);
	}

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				disabled={!reschedulable}
				title={
					reschedulable
						? undefined
						: `Too close to the call to reschedule (within ${RESCHEDULE_MIN_NOTICE_HOURS}h)`
				}
				onClick={() => setRescheduleOpen(true)}
			>
				<CalendarClock className="size-4" />
				Reschedule
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="border-destructive/40 text-destructive hover:bg-destructive/5"
				onClick={() => setCancelOpen(true)}
			>
				<X className="size-4" />
				Cancel
			</Button>

			<Sheet open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
				<SheetContent className="flex flex-col overflow-y-auto px-4 sm:max-w-2xl! sm:px-6">
					<SheetHeader className="px-0">
						<SheetTitle>Reschedule call</SheetTitle>
					</SheetHeader>
					<p className="mb-4 text-sm text-muted-foreground">
						Pick a new time from your availability. The mentee will be emailed
						the change.
					</p>
					<SlotPicker
						mentorSlug={mentorSlug}
						initialWeekStart={null}
						selectedStartUtc={null}
						onSelect={(newStartUtc) =>
							reschedule.execute({ bookingId, newStartUtc })
						}
					/>
				</SheetContent>
			</Sheet>

			<Sheet open={cancelOpen} onOpenChange={setCancelOpen}>
				<SheetContent className="flex flex-col px-4 sm:max-w-md! sm:px-6">
					<SheetHeader className="px-0">
						<SheetTitle>Cancel call</SheetTitle>
					</SheetHeader>
					<p className="mb-3 text-sm text-muted-foreground">
						The mentee will be emailed that the call is cancelled.
					</p>
					<Textarea
						placeholder="Optional message to the mentee…"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
					<div className="mt-4 flex gap-2">
						<Button
							variant="outline"
							className="border-destructive/40 text-destructive hover:bg-destructive/5"
							disabled={cancel.isPending}
							onClick={() =>
								cancel.execute({ bookingId, reason: reason || undefined })
							}
						>
							{cancel.isPending ? "Cancelling…" : "Confirm cancel"}
						</Button>
						<Button variant="ghost" onClick={() => setCancelOpen(false)}>
							Keep it
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
