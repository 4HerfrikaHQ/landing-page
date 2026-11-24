"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { resubscribe } from "../_actions";

export function ResubscribeButton({ e, t }: { e: string; t: string }) {
	const router = useRouter();
	const tr = useTranslations("unsubscribe.done");
	const action = useAction(resubscribe, {
		onSuccess: () =>
			router.replace(
				`/unsubscribe?${new URLSearchParams({ resubscribed: "1", e, t })}`,
			),
		onError: ({ error }) => toast.error(error.serverError ?? tr("error")),
	});

	return (
		<Button
			variant="outline"
			size="sm"
			disabled={action.isPending}
			onClick={() => action.execute({ e, t })}
			className="h-12 shrink-0 bg-white px-6 text-base font-medium hover:text-white"
		>
			{action.isPending ? tr("resubscribing") : tr("resubscribe")}
		</Button>
	);
}
