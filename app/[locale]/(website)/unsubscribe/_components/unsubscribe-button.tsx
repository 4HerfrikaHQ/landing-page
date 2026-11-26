"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { unsubscribe } from "../_actions";

export function UnsubscribeButton({ e, t }: { e: string; t: string }) {
	const router = useRouter();
	const tr = useTranslations("unsubscribe.confirm");
	const action = useAction(unsubscribe, {
		onSuccess: () =>
			router.replace(
				`/unsubscribe?${new URLSearchParams({ done: "1", e, t })}`,
			),
		onError: ({ error }) => toast.error(error.serverError ?? tr("error")),
	});

	return (
		<Button
			size="sm"
			disabled={action.isPending}
			onClick={() => action.execute({ e, t })}
			className="h-12 px-7 text-base font-medium"
		>
			{action.isPending ? tr("submitting") : tr("submit")}
		</Button>
	);
}
