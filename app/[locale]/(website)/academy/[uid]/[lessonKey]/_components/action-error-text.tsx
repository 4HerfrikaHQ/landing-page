"use client";

import { useTranslations } from "next-intl";

const KNOWN = [
	"session_expired",
	"lesson_unavailable",
	"not_finished",
	"not_completable",
	"video_unavailable",
	"already_submitted",
	"track_required",
] as const;

export function ActionErrorText({ code }: { code: string | undefined }) {
	const t = useTranslations("academy.lesson.errors");
	if (!code) return null;
	const known = KNOWN.find((item) => item === code);
	return (
		<p role="alert" className="mt-2 text-sm text-destructive">
			{t(known ?? "generic")}
		</p>
	);
}
