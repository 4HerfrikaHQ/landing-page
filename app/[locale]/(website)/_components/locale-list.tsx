"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";
import { cn } from "@/utils/cn";
import { useLocale, useTranslations } from "next-intl";
import { NAV_FOCUS_RING } from "./nav-styles";

type Locale = (typeof LOCALES)[number]["locale"];

type LocaleListProps = {
	onSelect: () => void;
};

export function LocaleList({ onSelect }: LocaleListProps) {
	const t = useTranslations("nav");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const switchLocale = (nextLocale: Locale) => {
		router.replace(pathname, { locale: nextLocale });
		onSelect();
	};

	return (
		<fieldset className="m-0 flex min-w-0 gap-2 border-0 p-0">
			<legend className="sr-only">{t("language")}</legend>
			{LOCALES.map((option) => (
				<button
					key={option.locale}
					type="button"
					lang={option.locale}
					aria-pressed={option.locale === locale}
					onClick={() => switchLocale(option.locale)}
					className={cn(
						"min-h-11 flex-1 cursor-pointer rounded-pill border-2 border-border px-3 text-sm font-medium text-foreground transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground",
						NAV_FOCUS_RING,
					)}
				>
					{option.name}
				</button>
			))}
		</fieldset>
	);
}
