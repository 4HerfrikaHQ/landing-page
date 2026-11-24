"use client";

import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

function focusOnMount(element: HTMLElement | null) {
	element?.focus();
}

export function BookingConfirmation({
	displayName,
	whenLabel,
	email,
}: {
	displayName: string;
	whenLabel: string;
	email: string;
}) {
	const t = useTranslations("mentorProfile.confirmed");

	return (
		<div className="flex-1 overflow-y-auto px-4 pb-8 pt-2 sm:px-6 lg:flex lg:flex-col lg:justify-center">
			<span className="grid size-16 place-items-center rounded-pill bg-[#e6f4ec] text-[#14703f]">
				<Check className="size-8" aria-hidden="true" />
			</span>
			<h2
				ref={focusOnMount}
				tabIndex={-1}
				className="mt-5 text-[28px] font-bold leading-tight outline-none lg:text-[32px]"
			>
				{t.rich("title", {
					name: displayName,
					em: (chunks) => (
						<em className="font-playfair font-black text-primary">{chunks}</em>
					),
				})}
			</h2>
			<p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
				{t("body", { email })}
			</p>
			<dl className="mt-6 divide-y divide-border overflow-hidden rounded-[24px] border border-border">
				<div className="grid grid-cols-[6rem_1fr] gap-3 px-4 py-4 text-[15px]">
					<dt className="text-muted-foreground">{t("when")}</dt>
					<dd className="font-semibold">{whenLabel}</dd>
				</div>
				<div className="grid grid-cols-[6rem_1fr] gap-3 px-4 py-4 text-[15px]">
					<dt className="text-muted-foreground">{t("where")}</dt>
					<dd>
						<span className="font-semibold">{t("whereValue")}</span>
						<span className="text-muted-foreground"> · {t("whereNote")}</span>
					</dd>
				</div>
			</dl>
			<p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
				{t("manage")}
			</p>
			<Link
				href="/careercorner"
				className="mt-4 inline-flex h-12 items-center justify-center rounded-pill border-2 border-primary bg-white px-6 font-medium text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{t("back")}
			</Link>
		</div>
	);
}
