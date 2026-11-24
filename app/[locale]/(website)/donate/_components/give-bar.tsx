"use client";

import { useTranslations } from "next-intl";
import { useElementInView } from "../_hooks/use-element-in-view";

export function GiveBar() {
	const t = useTranslations("donate.bar");
	const bankDetailsInView = useElementInView("bank-details");

	return (
		<div
			data-hidden={bankDetailsInView}
			aria-hidden={bankDetailsInView}
			className="sticky bottom-0 z-30 border-t border-border bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 data-[hidden=true]:pointer-events-none data-[hidden=true]:translate-y-full motion-reduce:transition-none lg:hidden"
		>
			<div className="flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold">{t("title")}</p>
					<p className="truncate text-xs text-muted-foreground">
						{t("subtitle")}
					</p>
				</div>
				<a
					href="#give"
					tabIndex={bankDetailsInView ? -1 : 0}
					className="inline-flex h-12 shrink-0 items-center rounded-full bg-primary-500 px-6 font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
				>
					{t("cta")}
				</a>
			</div>
		</div>
	);
}
