"use client";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeLesson } from "../_actions/complete";
import { ActionErrorText } from "./action-error-text";
import { PRIMARY_ACTION } from "./lesson-footer";

type Props = {
	uid: string;
	lessonKey: string;
	label: "continue" | "markRead";
	completed: boolean;
	enabled: boolean;
	nextHref: string | null;
	courseHref: string;
};

export function CompleteButton({
	uid,
	lessonKey,
	label,
	completed,
	enabled,
	nextHref,
	courseHref,
}: Props) {
	const t = useTranslations("academy.lesson");
	const router = useRouter();
	const action = useAction(completeLesson, {
		onSuccess: ({ data }) => {
			if (data?.finishedCourse) router.push(`${courseHref}/complete` as Route);
			else if (nextHref) router.push(nextHref as Route);
			else router.refresh();
		},
	});
	const busy = action.isPending || action.hasSucceeded;

	if (completed) {
		return (
			<Link href={(nextHref ?? courseHref) as Route} className={PRIMARY_ACTION}>
				{nextHref ? t("continue") : t("backToCourse")}
				<ArrowRight className="size-4" aria-hidden />
			</Link>
		);
	}
	return (
		<>
			<button
				type="button"
				disabled={!enabled || busy}
				onClick={() => action.execute({ uid, lessonKey })}
				className={PRIMARY_ACTION}
			>
				{busy ? t("saving") : t(label)}
				<ArrowRight className="size-4" aria-hidden />
			</button>
			<ActionErrorText code={action.result.serverError} />
		</>
	);
}
