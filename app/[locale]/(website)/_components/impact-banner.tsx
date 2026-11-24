"use client";

import { RollLabel } from "@/components/ui/roll-label";
import { Link, usePathname } from "@/i18n/navigation";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDismissed } from "./use-dismissed";

const DISMISS_KEY = "banner:year-2-report";
const HIDDEN_ON = ["/donate", "/impact/year-2"];

export function ImpactBanner() {
	const t = useTranslations("impactBanner");
	const pathname = usePathname();
	const { dismissed, dismiss } = useDismissed(DISMISS_KEY);

	if (dismissed || HIDDEN_ON.some((path) => pathname.startsWith(path))) {
		return null;
	}

	return (
		<aside
			aria-label={t("label")}
			className="impact-banner fixed inset-x-0 bottom-0 z-40 bg-primary-bright text-secondary-500"
		>
			<div className="mx-auto flex h-14 max-w-6xl items-center gap-3 pr-1 pl-4 lg:gap-5 lg:px-6">
				<span className="hidden rounded-md bg-secondary-500 px-2 py-1 text-xs font-bold tracking-[0.12em] text-primary-bright uppercase sm:inline">
					{t("badge")}
				</span>
				<p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-wide uppercase sm:flex-none lg:text-[15px]">
					{t("title")}
					<span className="ml-3 hidden font-medium normal-case tracking-normal text-secondary-500/80 md:inline">
						{t("description")}
					</span>
				</p>
				<Link
					href="/impact/year-2"
					className="press ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-secondary-500 px-4 text-sm font-semibold text-white outline-none hover:bg-white hover:text-secondary-500 hover:no-underline focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-bright lg:px-5"
				>
					<RollLabel>{t("cta")} →</RollLabel>
				</Link>
				<button
					type="button"
					onClick={dismiss}
					aria-label={t("dismiss")}
					className="press inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-secondary-500/10 focus-visible:ring-2 focus-visible:ring-secondary-500"
				>
					<X aria-hidden="true" className="size-5" />
				</button>
			</div>
		</aside>
	);
}
