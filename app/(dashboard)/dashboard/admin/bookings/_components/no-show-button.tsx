"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserX } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { markBookingNoShow } from "../_actions";

export function NoShowButton({
	bookingId,
	menteeName,
}: {
	bookingId: string;
	menteeName: string;
}) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const action = useAction(markBookingNoShow, {
		onSuccess: () => {
			setConfirmOpen(false);
			toast.success("Marked as no-show.");
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't mark no-show."),
	});
	return (
		<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground hover:bg-rose-50 hover:text-rose-700"
				disabled={action.isPending}
				onClick={() => setConfirmOpen(true)}
			>
				<UserX className="size-4" />
				Mark as no-show
			</Button>

			<DialogContent className="overflow-hidden p-0" showCloseButton={false}>
				<div className="p-5">
					<div className="mb-4 flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-700">
						<UserX className="size-5" />
					</div>
					<DialogHeader>
						<DialogTitle>Mark this session as a no-show?</DialogTitle>
						<DialogDescription>
							This records that {menteeName} did not attend and updates the
							booking statistics.
						</DialogDescription>
					</DialogHeader>
				</div>
				<DialogFooter className="m-0 rounded-none px-5 py-4">
					<DialogClose render={<Button variant="ghost" size="sm" />}>
						Keep unchanged
					</DialogClose>
					<Button
						variant="solid"
						size="sm"
						className="bg-rose-700 text-white hover:bg-rose-800"
						disabled={action.isPending}
						onClick={() => action.execute({ bookingId })}
					>
						{action.isPending ? "Updating…" : "Mark as no-show"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
