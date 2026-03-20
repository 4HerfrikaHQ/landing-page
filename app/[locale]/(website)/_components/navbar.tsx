import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ACTION_BUTTONS, NAV_LINKS, type Navlink } from "./_schema";
import Logo from "./icons/4herfrika-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { NavbarLink } from "./navbar-link";
import { YearOneReport } from "./year-one-report";

export const Navbar = async () => {
	const tn = await getTranslations("nav");
	const tc = await getTranslations("common");

	return (
		<div className="relative">
			<YearOneReport />
			<header className="sticky inset-x-0 top-0 z-50 bg-background h-16 lg:h-22.5">
				<nav
					className="flex items-center justify-between h-full px-6 lg:px-8"
					aria-label="Global"
				>
					<div className="flex lg:flex-1">
						<Link href={"/" as Route} className="-m-1.5 p-1.5">
							<span className="sr-only">4Herfrika</span>
							<Logo className="w-30 lg:w-38.75" />
						</Link>
					</div>
					<div className="flex items-center gap-2 xl:hidden">
						<LocaleSwitcher />
						<MobileNav />
					</div>

					<div className="hidden relative xl:flex xl:items-center xl:gap-x-8 text-foreground h-full">
						{NAV_LINKS.map((link: Navlink) =>
							link.dropdownItems ? (
								<div
									key={link.nameKey}
									className="relative group h-full flex items-center"
								>
									<Button
										variant="ghost"
										type="button"
										className="flex items-center gap-1 text-foreground hover:text-primary-500"
										aria-haspopup="true"
									>
										{tn(link.nameKey)}
										<ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
									</Button>

									<div className="absolute top-[75%] left-1/2 -translate-x-1/2 mt-2 w-48 bg-background shadow-lg z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform group-hover:translate-y-2 rounded-md">
										{link.dropdownItems.map((dropdownItem) => (
											<Link
												key={dropdownItem.nameKey}
												href={dropdownItem.href as Route}
												className="block px-4 py-2 text-sm text-foreground hover:bg-muted first:rounded-t-md last:rounded-b-md"
											>
												{tn(dropdownItem.nameKey)}
											</Link>
										))}
									</div>
								</div>
							) : (
								<NavbarLink
									key={link.nameKey}
									className="lg:text-base h-full flex items-center"
									href={link.href as Route}
								>
									{tn(link.nameKey)}
								</NavbarLink>
							),
						)}
					</div>
					<div className="hidden xl:flex xl:flex-1 xl:justify-end xl:items-center gap-4">
						<LocaleSwitcher />
						{ACTION_BUTTONS.map((button) => (
							<Link
								key={button.nameKey}
								href={button.href as Route}
								className={`text-base font-medium py-2 px-6 rounded-full transition-colors ${
									button.isPrimary
										? "bg-primary-500 text-white hover:bg-primary-400"
										: "border border-primary-500 text-primary-500 hover:bg-primary-50"
								}`}
							>
								{tc(button.nameKey)}
							</Link>
						))}
					</div>
				</nav>
			</header>
		</div>
	);
};
