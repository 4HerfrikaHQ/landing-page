"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { enrolInCourse } from "../_actions";

const KNOWN_ERRORS = ["course_updating", "course_not_found"] as const;

function errorKey(message: string | undefined) {
	const known = KNOWN_ERRORS.find((code) => code === message);
	return known ?? "generic";
}

export function EnrolButton({ uid }: { uid: string }) {
	const t = useTranslations("academy.course");
	const enrol = useAction(enrolInCourse);
	const busy = enrol.isPending || enrol.hasSucceeded;
	const serverError = enrol.result.serverError;
	const label = busy ? t("enrolling") : t("startFree");

	return (
		<div className="flex flex-col gap-2">
			<Button
				type="button"
				size="lg"
				disabled={busy}
				onClick={() => enrol.execute({ uid })}
				className="min-h-12 w-full whitespace-normal text-center text-base md:py-3 md:text-base"
			>
				{label}
			</Button>
			<EnrolError message={serverError} />
		</div>
	);
}

function EnrolError({ message }: { message: string | undefined }) {
	const t = useTranslations("academy.course");
	if (!message) return null;
	return (
		<p role="alert" className="text-sm text-destructive">
			{t(`errors.${errorKey(message)}`)}
		</p>
	);
}
