import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";

const CIRCLE =
	"flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-indigo text-secondary-500";

export function PreviousLink({ href }: { href: string | null }) {
	const t = useTranslations("academy.lesson");
	if (!href) {
		return (
			<span aria-hidden className={`${CIRCLE} opacity-40`}>
				<ArrowLeft className="size-5" />
			</span>
		);
	}
	return (
		<Link
			href={href as Route}
			aria-label={t("previous")}
			className={`${CIRCLE} outline-offset-2 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary-500`}
		>
			<ArrowLeft className="size-5" />
		</Link>
	);
}

export function LessonFooter({
	previousHref,
	children,
}: {
	previousHref: string | null;
	children: ReactNode;
}) {
	const t = useTranslations("academy.lesson");
	return (
		<nav
			aria-label={t("lessonNav")}
			className="sticky bottom-0 z-10 mt-auto flex items-center gap-3 border-t border-border bg-white py-3 lg:justify-between"
		>
			<PreviousLink href={previousHref} />
			<div className="flex min-w-0 flex-1 flex-col items-stretch lg:flex-none">
				{children}
			</div>
		</nav>
	);
}

export const PRIMARY_ACTION =
	"inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-8 py-3 text-base font-semibold text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-56";

export const SECONDARY_ACTION =
	"inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-primary-500 px-8 py-3 text-base font-semibold text-primary-700 outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-secondary-500 lg:w-auto";
