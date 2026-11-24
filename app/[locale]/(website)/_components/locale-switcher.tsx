"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { NAV_FOCUS_RING } from "./nav-styles";

type Locale = (typeof LOCALES)[number]["locale"];

export function LocaleSwitcher() {
	const t = useTranslations("nav");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const switchLocale = (nextLocale: Locale) => {
		router.replace(pathname, { locale: nextLocale });
	};

	return (
		<Menu.Root>
			<Menu.Trigger
				aria-label={t("language")}
				className={`inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-pill px-3 text-sm text-muted-foreground press hover:text-foreground ${NAV_FOCUS_RING}`}
			>
				<span aria-hidden="true">{locale.toUpperCase()}</span>
				<ChevronDown aria-hidden="true" className="size-4" />
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner align="end" sideOffset={8} className="z-60">
					<Menu.Popup className="min-w-40 rounded-2xl border border-border bg-background p-1 shadow-lg outline-none">
						<Menu.RadioGroup
							value={locale}
							onValueChange={(value: Locale) => switchLocale(value)}
						>
							{LOCALES.map((option) => (
								<Menu.RadioItem
									key={option.locale}
									value={option.locale}
									lang={option.locale}
									className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-sm text-foreground outline-none data-highlighted:bg-muted data-checked:font-semibold data-checked:text-primary"
								>
									{option.name}
									<Menu.RadioItemIndicator>
										<Check aria-hidden="true" className="size-4" />
									</Menu.RadioItemIndicator>
								</Menu.RadioItem>
							))}
						</Menu.RadioGroup>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
