import { PartyPopper } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SECONDARY_ACTION } from "./lesson-footer";

export function FinishState({
	show,
	courseHref,
}: {
	show: boolean;
	courseHref: string;
}) {
	const t = useTranslations("academy.lesson.finish");
	if (!show) return null;
	return (
		<section
			aria-live="polite"
			className="flex flex-col items-start gap-3 rounded-2xl bg-surface-pink p-5"
		>
			<PartyPopper className="size-8 text-primary-700" aria-hidden />
			<h2 className="text-2xl font-semibold text-secondary-500">
				{t("title")}
			</h2>
			<p className="text-lg text-secondary-500">{t("body")}</p>
			<Link href={courseHref as Route} className={SECONDARY_ACTION}>
				{t("action")}
			</Link>
		</section>
	);
}
