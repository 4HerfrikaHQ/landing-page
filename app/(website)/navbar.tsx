"use client";

import { MenubarButton } from "@/components/MenubarButton";
import { NavbarLink } from "@/components/NavbarLink";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import Logo from "./4herfrika-logo.svg";
import { ACTION_BUTTONS, NAV_LINKS } from "./_schema";

export const Navbar = () => {
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const hoveredDropdown = NAV_LINKS.find((link) => link.name === hoveredItem);

	return (
		<div className="relative">
			<header
				className="sticky inset-x-0 top-0 z-50 bg-white"
				onMouseLeave={() => setHoveredItem(null)}
			>
				<nav
					className="flex items-center justify-between p-6 lg:px-8"
					aria-label="Global"
				>
					<div className="flex lg:flex-1">
						<a href="/" className="-m-1.5 p-1.5">
							<span className="sr-only">4Herfrika</span>
							<Logo className="w-[120px] lg:w-[155px]" />
						</a>
					</div>

					<div className="flex lg:hidden">
						<MenubarButton />
					</div>

					<div className="hidden lg:flex lg:gap-x-8 text-gray-400">
						{NAV_LINKS.slice(0, -1).map((link) =>
							link.dropdownItems ? (
								<div
									key={link.name}
									onMouseEnter={() => setHoveredItem(link.name)}
									className="relative"
								>
									<button
										type="button"
										className="flex items-center gap-1 text-gray-600 hover:text-primary-500"
									>
										{link.name}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className={`transition-transform ${
												hoveredItem === link.name ? "rotate-180" : ""
											}`}
										>
											<title>Arrow Down</title>
											<polyline points="6 9 12 15 18 9" />
										</svg>
									</button>
								</div>
							) : (
								<NavbarLink
									key={link.name}
									className="lg:text-base"
									href={link.href as Route}
								>
									{link.name}
								</NavbarLink>
							),
						)}
					</div>

					<div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center gap-4">
						{ACTION_BUTTONS.map((button) => (
							<Link
								key={button.name}
								href={button.href as Route}
								className={`text-base font-medium py-2 px-6 rounded-full transition-colors ${
									button.isPrimary
										? "bg-primary-500 text-white hover:bg-primary-400"
										: "border border-primary-500 text-primary-500 hover:bg-primary-50"
								}`}
							>
								{button.name}
							</Link>
						))}
					</div>
				</nav>
				{hoveredDropdown?.dropdownItems && (
					<div
						onMouseEnter={() => setHoveredItem(hoveredDropdown.name)}
						onMouseLeave={() => setHoveredItem(null)}
						className="absolute top-[70%] left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
					>
						{hoveredDropdown.dropdownItems.map((dropdownItem) => (
							<Link
								key={dropdownItem.name}
								href={dropdownItem.href as Route}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
							>
								{dropdownItem.name}
							</Link>
						))}
					</div>
				)}

				{/* Mobile menu dialog */}
				<dialog id="menu" className="lg:hidden" aria-modal="true">
					<div className="fixed inset-0 z-50" />
					<div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-200/10">
						<div className="flex items-center justify-between">
							<Link href="/" className="-m-1.5 p-1.5">
								<span className="sr-only">4Herfrika</span>
								<Logo />
							</Link>
							<form
								method="dialog"
								className="-m-2.5 rounded-md p-2.5 text-gray-300"
							>
								<button type="submit">
									<span className="sr-only">Close menu</span>
									<svg
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</form>
						</div>

						<div className="mt-6 flow-root">
							<div className="-my-6 divide-y divide-gray-500/10">
								<div className="space-y-2 py-6">
									{NAV_LINKS.map((link) => (
										<div key={link.name}>
											{link.dropdownItems ? (
												<>
													<NavbarLink
														href={link.href as Route}
														className="-mx-3 block px-3 py-2 text-base"
													>
														{link.name}
													</NavbarLink>
													<div className="ml-4 mt-1 space-y-1">
														{link.dropdownItems.map((dropdownItem) => (
															<NavbarLink
																key={dropdownItem.name}
																href={dropdownItem.href as Route}
																className="-mx-3 block px-3 py-1 text-sm"
															>
																{dropdownItem.name}
															</NavbarLink>
														))}
													</div>
												</>
											) : (
												<NavbarLink
													href={link.href as Route}
													className="-mx-3 block px-3 py-2 text-base"
												>
													{link.name}
												</NavbarLink>
											)}
										</div>
									))}
								</div>

								<div className="py-6 space-y-3">
									{ACTION_BUTTONS.map((button) => (
										<Link
											key={button.name}
											href={button.href as Route}
											className={`block w-full text-center py-2 px-3 rounded-full ${
												button.isPrimary
													? "bg-primary-500 text-white hover:bg-primary-400"
													: "border border-primary-500 text-primary-500 hover:bg-primary-50"
											}`}
										>
											{button.name}
										</Link>
									))}
								</div>
							</div>
						</div>
					</div>
				</dialog>
			</header>
		</div>
	);
};
