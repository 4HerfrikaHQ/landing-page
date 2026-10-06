"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { confirmAttendance } from "../_actions";

export function AttendanceForm({ token }: { token: string }) {
	const t = useTranslations("attendance");
	const confirm = useAction(confirmAttendance, {
		onError: () => toast.error(t("error")),
	});

	if (confirm.hasSucceeded) {
		return (
			<EmptyState
				icon={CheckCircle2}
				title={t("savedTitle")}
				description={t("savedDescription")}
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
				{t("yes")}
			</Button>
			<Button
				variant="outline"
				className="flex-1"
				onClick={() => confirm.execute({ token, attended: false })}
				disabled={confirm.isPending}
			>
				{t("no")}
			</Button>
		</div>
	);
}
