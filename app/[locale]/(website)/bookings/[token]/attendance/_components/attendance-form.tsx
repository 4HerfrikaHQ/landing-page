"use client";

import { Button } from "@/components/ui/button";
import type { MentorAttendance } from "@/src/db/schema/tables/bookings";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { confirmAttendance } from "../_actions";

export function AttendanceForm({
	token,
	initialAnswer,
}: {
	token: string;
	initialAnswer: MentorAttendance | null;
}) {
	const t = useTranslations("attendance");
	const [answer, setAnswer] = useState(initialAnswer);
	const confirm = useAction(confirmAttendance, {
		onSuccess: ({ input }) => {
			setAnswer(input.attendance);
			toast.success(t("savedTitle"));
		},
		onError: () => toast.error(t("error")),
	});

	const choose = (attendance: MentorAttendance) => {
		if (attendance !== answer) confirm.execute({ token, attendance });
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row">
				<Button
					variant={answer === "attended" ? "solid" : "outline"}
					aria-pressed={answer === "attended"}
					className="flex-1"
					onClick={() => choose("attended")}
					disabled={confirm.isPending}
				>
					{t("yes")}
				</Button>
				<Button
					variant={answer === "no_show" ? "solid" : "outline"}
					aria-pressed={answer === "no_show"}
					className="flex-1"
					onClick={() => choose("no_show")}
					disabled={confirm.isPending}
				>
					{t("no")}
				</Button>
			</div>
			{answer ? (
				<p className="text-sm text-muted-foreground">{t("canChange")}</p>
			) : null}
		</div>
	);
}
