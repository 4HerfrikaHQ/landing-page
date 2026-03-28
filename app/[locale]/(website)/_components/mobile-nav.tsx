"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ACTION_BUTTONS, NAV_LINKS, type Navlink } from "./_schema";
import Logo from "./icons/4herfrika-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { NavbarLink } from "./navbar-link";

export const MobileNav = () => {
	const [open, setOpen] = useState(false);
	const tn = useTranslations("nav");
	const tc = useTranslations("common");

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="-m-2.5 text-muted-foreground xl:hidden"
					/>
				}
			>
				<span className="sr-only">Open main menu</span>
				<Menu className="h-6 w-6" />
			</SheetTrigger>

			<SheetContent side="right" className="px-6 py-6 overflow-y-auto">
				<div className="flex items-center justify-between">
					<Link
						href={"/" as Route}
						className="-m-1.5 p-1.5"
						onClick={() => setOpen(false)}
					>
						<span className="sr-only">4Herfrika</span>
						<Logo />
					</Link>
					<SheetTitle className="sr-only">Navigation menu</SheetTitle>
				</div>

				<nav className="mt-6">
					{NAV_LINKS.map((link: Navlink) => (
						<div key={link.nameKey}>
							{link.dropdownItems ? (
								<div className="space-y-1">
									<input
										type="checkbox"
										id={`mobile-dropdown-${link.nameKey}`}
										className="peer hidden"
									/>
									<label
										htmlFor={`mobile-dropdown-${link.nameKey}`}
										className="flex cursor-pointer items-center justify-between -mx-3 px-3 py-2 text-base text-foreground"
									>
										<span>{tn(link.nameKey)}</span>
										<ChevronDown className="h-4 w-4 transition-transform duration-300 peer-checked:rotate-180" />
									</label>

									<div className="max-h-0 overflow-hidden transition-all duration-300 peer-checked:max-h-40">
										{link.dropdownItems.map((dropdownItem) => (
											<NavbarLink
												key={dropdownItem.nameKey}
												href={dropdownItem.href as Route}
												className="-mx-3 block px-3 py-2 text-base text-foreground"
												onClick={() => setOpen(false)}
											>
												{tn(dropdownItem.nameKey)}
											</NavbarLink>
										))}
									</div>
								</div>
							) : (
								<NavbarLink
									href={link.href as Route}
									className="-mx-3 block px-3 py-2 text-base"
									onClick={() => setOpen(false)}
								>
									{tn(link.nameKey)}
								</NavbarLink>
							)}
						</div>
					))}
				</nav>

				<div className="mt-6 space-y-2">
					{ACTION_BUTTONS.map((button) => (
						<Button
							key={button.nameKey}
							href={button.href as Route}
							variant={button.isPrimary ? "solid" : "outline"}
							size="lg"
							className="w-full justify-center"
							onClick={() => setOpen(false)}
						>
							{tc(button.nameKey)}
						</Button>
					))}
				</div>

				<div className="mt-6 border-t border-border pt-4">
					<LocaleSwitcher />
				</div>
			</SheetContent>
		</Sheet>
	);
};
