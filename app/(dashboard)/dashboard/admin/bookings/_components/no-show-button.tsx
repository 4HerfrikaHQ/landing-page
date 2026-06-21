"use client";

import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markBookingNoShow } from "../_actions";

export function NoShowButton({ bookingId }: { bookingId: string }) {
	const router = useRouter();
	const action = useAction(markBookingNoShow, {
		onSuccess: () => {
			toast.success("Marked as no-show.");
			router.refresh();
		},
		onError: ({ error }) =>
			toast.error(error.serverError ?? "Couldn't mark no-show."),
	});
	return (
		<Button
			variant="outline"
			size="sm"
			disabled={action.isPending}
			onClick={() => action.execute({ bookingId })}
		>
			<UserX className="size-4" />
			No-show
		</Button>
	);
}
