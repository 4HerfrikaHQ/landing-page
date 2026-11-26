"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import Logo from "../4herfrika-logo";
import { NAV_LINKS } from "../navigation";
import { DonateLink, JoinUsLink } from "./action-links";
import { isActivePath } from "./is-active-path";
import { LocaleSwitcher } from "./locale-switcher";
import { NAV_FOCUS_RING } from "./nav-styles";

export function DesktopNav() {
	const t = useTranslations("nav");
	const pathname = usePathname();

	return (
		<nav
			aria-label={t("mainLabel")}
			className="pointer-events-auto mx-auto hidden h-16 w-[calc(100%-206px)] max-w-314.5 items-center rounded-pill bg-background px-3 shadow-md xl:flex"
		>
			<Link
				href="/"
				aria-label={t("homeLabel")}
				className={cn("shrink-0 rounded-pill pl-2", NAV_FOCUS_RING)}
			>
				<Logo alt="" className="h-9 w-auto" />
			</Link>
			<ul className="ml-auto flex items-center gap-5 whitespace-nowrap text-[17px] text-foreground min-[1400px]:gap-7">
				{NAV_LINKS.map((link) => {
					const active = isActivePath(pathname, link.href);
					return (
						<li key={link.href}>
							<Link
								href={link.href}
								aria-current={active ? "page" : undefined}
								className={cn(
									"inline-flex h-11 items-center rounded-pill decoration-2 underline-offset-8 hover:text-primary hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-primary aria-[current=page]:underline",
									NAV_FOCUS_RING,
								)}
							>
								{t(link.labelKey)}
							</Link>
						</li>
					);
				})}
			</ul>
			<div className="ml-6">
				<LocaleSwitcher />
			</div>
			<div className="ml-6 flex items-center gap-2">
				<DonateLink className="h-11 px-6" />
				<JoinUsLink className="h-11 px-6" />
			</div>
		</nav>
	);
}
