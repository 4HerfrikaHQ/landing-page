"use client";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Logo from "../4herfrika-logo";
import { NAV_LINKS } from "../navigation";
import { DonateLink, JoinUsLink } from "./action-links";
import { isActivePath } from "./is-active-path";
import { LocaleList } from "./locale-list";
import { NAV_FOCUS_RING } from "./nav-styles";

const ROUND_BUTTON_STYLES =
	"inline-flex size-11 shrink-0 press cursor-pointer items-center justify-center rounded-pill bg-secondary text-secondary-foreground";

export function MobileNav() {
	const t = useTranslations("nav");
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const closeMenu = () => setOpen(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<nav
				aria-label={t("mainLabel")}
				className="pointer-events-auto mx-auto flex h-14 w-full items-center gap-2 rounded-pill bg-background pr-1.5 pl-4 shadow-md xl:hidden"
			>
				<Link
					href="/"
					aria-label={t("homeLabel")}
					className={cn("shrink-0 rounded-pill", NAV_FOCUS_RING)}
				>
					<Logo alt="" className="h-7 w-auto" />
				</Link>
				<DonateLink className="ml-auto h-11 px-4 text-sm" />
				<SheetTrigger
					aria-label={t("openMenu")}
					className={cn(ROUND_BUTTON_STYLES, NAV_FOCUS_RING)}
				>
					<Menu aria-hidden="true" className="size-5" />
				</SheetTrigger>
			</nav>

			<SheetContent
				side="right"
				showCloseButton={false}
				overlayClassName="z-70"
				className="z-80 h-dvh gap-0 p-3 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
			>
				<div className="flex h-14 shrink-0 items-center justify-between pr-1.5 pl-4">
					<Link
						href="/"
						aria-label={t("homeLabel")}
						onClick={closeMenu}
						className={cn("rounded-pill", NAV_FOCUS_RING)}
					>
						<Logo alt="" className="h-7 w-auto" />
					</Link>
					<SheetTitle className="sr-only">{t("menuTitle")}</SheetTitle>
					<SheetClose
						aria-label={t("closeMenu")}
						className={cn(ROUND_BUTTON_STYLES, NAV_FOCUS_RING)}
					>
						<X aria-hidden="true" className="size-5" />
					</SheetClose>
				</div>

				<nav
					aria-label={t("menuTitle")}
					className="mt-4 min-h-0 flex-1 overflow-y-auto px-4"
				>
					<ul>
						{NAV_LINKS.map((link) => {
							const active = isActivePath(pathname, link.href);
							return (
								<li key={link.href} className="border-b border-border">
									<Link
										href={link.href}
										onClick={closeMenu}
										aria-current={active ? "page" : undefined}
										className={cn(
											"flex min-h-14 items-center text-2xl text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-primary",
											NAV_FOCUS_RING,
										)}
									>
										{t(link.labelKey)}
									</Link>
								</li>
							);
						})}
					</ul>
					<div className="py-6">
						<LocaleList onSelect={closeMenu} />
					</div>
				</nav>

				<div
					className="grid shrink-0 grid-cols-2 gap-3 px-4 pt-4"
					style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
				>
					<DonateLink onNavigate={closeMenu} className="h-12 text-base" />
					<JoinUsLink onNavigate={closeMenu} className="h-12 text-base" />
				</div>
			</SheetContent>
		</Sheet>
	);
}
