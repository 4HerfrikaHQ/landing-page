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
import Logo from "../4herfrika-logo";
import { ACTION_BUTTONS, NAV_LINKS, type Navlink } from "../navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { NavbarLink } from "./navbar-link";

const NAV_LINK_KEYS: Record<string, string> = {
	"About Us": "aboutUs",
	"Impact Hub": "impactHub",
	Projects: "projects",
	Academy: "academy",
	"Career Corner": "careerCorner",
	Blog: "blog",
	"Contact Us": "contactUs",
};

const ACTION_BUTTON_KEYS: Record<string, string> = {
	Donate: "donate",
	"Join Us": "joinUs",
};

/** `id` must not contain whitespace, and nav names like "Impact Hub" do. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const MobileNav = () => {
	const [open, setOpen] = useState(false);
	const tn = useTranslations("nav");
	const tc = useTranslations("common");

	const getNavName = (name: string) => {
		const key = NAV_LINK_KEYS[name];
		// biome-ignore lint/suspicious/noExplicitAny: translation key is dynamic
		return key ? tn(key as any) : name;
	};

	const getActionName = (name: string) => {
		const key = ACTION_BUTTON_KEYS[name];
		// biome-ignore lint/suspicious/noExplicitAny: translation key is dynamic
		return key ? tc(key as any) : name;
	};

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

			<SheetContent
				side="right"
				className="z-80 overflow-y-auto px-6 py-6"
				overlayClassName="z-70"
			>
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
						<div key={link.name}>
							{link.dropdownItems ? (
								<div className="space-y-1">
									<input
										type="checkbox"
										id={`mobile-dropdown-${slug(link.name)}`}
										className="peer hidden"
									/>
									{/* The chevron is a descendant of the label, not a sibling of the
									    peer input, so the rotate has to be applied from the label. */}
									<label
										htmlFor={`mobile-dropdown-${slug(link.name)}`}
										className="flex cursor-pointer items-center justify-between -mx-3 px-3 py-3 text-base text-foreground peer-checked:[&>svg]:rotate-180"
									>
										<span>{getNavName(link.name)}</span>
										<ChevronDown className="h-4 w-4 transition-transform duration-300" />
									</label>

									{/* Sized from the item count rather than a fixed cap: a row is
									    py-3 + text-base = 3rem, and 4.5rem each leaves room for a
									    label that wraps to two lines. A hard max-h-40 clipped the
									    fourth item, and an over-generous one makes the open/close
									    transition cover mostly empty space, which reads as a snap. */}
									<div
										className="max-h-0 overflow-hidden transition-all duration-300 peer-checked:max-h-(--dropdown-max-h)"
										style={
											{
												"--dropdown-max-h": `${link.dropdownItems.length * 4.5}rem`,
											} as React.CSSProperties
										}
									>
										{link.dropdownItems.map((dropdownItem) => (
											<NavbarLink
												key={dropdownItem.name}
												href={dropdownItem.href as Route}
												className="-mx-3 block px-3 py-3 text-base text-foreground"
												onClick={() => setOpen(false)}
											>
												{getNavName(dropdownItem.name)}
											</NavbarLink>
										))}
									</div>
								</div>
							) : (
								<NavbarLink
									href={link.href as Route}
									className="-mx-3 block px-3 py-3 text-base"
									onClick={() => setOpen(false)}
								>
									{getNavName(link.name)}
								</NavbarLink>
							)}
						</div>
					))}
				</nav>

				<div className="mt-6 space-y-2">
					{ACTION_BUTTONS.map((button) => (
						<Button
							key={button.name}
							href={button.href as Route}
							isExternal={button.isExternal}
							variant={button.isPrimary ? "solid" : "outline"}
							size="lg"
							className="w-full justify-center"
							onClick={() => setOpen(false)}
						>
							{getActionName(button.name)}
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
