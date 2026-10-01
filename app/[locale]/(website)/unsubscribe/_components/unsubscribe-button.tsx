"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { unsubscribe } from "../_actions";

export function UnsubscribeButton({ e, t }: { e: string; t: string }) {
	const router = useRouter();
	const action = useAction(unsubscribe, {
		onSuccess: () => router.replace("/unsubscribe?done=1"),
		onError: ({ error }) =>
			toast.error(
				error.serverError ?? "Couldn't unsubscribe. Please try again.",
			),
	});

	return (
		<Button
			disabled={action.isPending}
			onClick={() => action.execute({ e, t })}
		>
			{action.isPending ? "Unsubscribing…" : "Unsubscribe"}
		</Button>
	);
}
