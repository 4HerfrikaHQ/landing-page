import type { Route } from "next";
import Link from "next/link";
import { MenubarButton } from "@/components/MenubarButton";
import { NavbarLink } from "@/components/NavbarLink";
import Logo from "../4herfrika-logo";
import { ACTION_BUTTONS, NAV_LINKS, type Navlink } from "../navigation";
import { YearOneReport } from "./year-one-report";

export const Navbar = () => {
	return (
		<div className="relative">
			<YearOneReport />
			<header className="sticky inset-x-0 top-0 z-50 bg-white h-16 lg:h-[90px]">
				<nav
					className="flex items-center justify-between h-full px-6 lg:px-8"
					aria-label="Global"
				>
					<div className="flex lg:flex-1">
						<a href="/" className="-m-1.5 p-1.5">
							<span className="sr-only">4Herfrika</span>
							<Logo className="w-[120px] lg:w-[155px]" />
						</a>
					</div>
					<div className="flex xl:hidden">
						<MenubarButton />
					</div>

					<div className="hidden relative xl:flex xl:items-center xl:gap-x-8 text-gray-400 h-full">
						{NAV_LINKS.map((link: Navlink) =>
							link.dropdownItems ? (
								<div
									key={link.name}
									className="relative group h-full flex items-center"
								>
									<button
										type="button"
										className="flex items-center gap-1 text-gray-900 hover:text-primary-500"
										aria-haspopup="true"
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
											className="transition-transform group-hover:rotate-180"
										>
											<title>Arrow</title>
											<polyline points="6 9 12 15 18 9" />
										</svg>
									</button>

									<div className="absolute top-[75%] left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-lg z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform group-hover:translate-y-2 rounded-md">
										{link.dropdownItems.map((dropdownItem) => (
											<Link
												key={dropdownItem.name}
												href={dropdownItem.href as Route}
												className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
											>
												{dropdownItem.name}
											</Link>
										))}
									</div>
								</div>
							) : (
								<NavbarLink
									key={link.name}
									className="lg:text-base h-full flex items-center"
									href={link.href as Route}
								>
									{link.name}
								</NavbarLink>
							),
						)}
					</div>
					<div className="hidden xl:flex xl:flex-1 xl:justify-end xl:items-center gap-4">
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

				{/* Mobile menu dialog */}
				<dialog id="menu" className="xl:hidden" aria-modal="true">
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

						{NAV_LINKS.map((link: Navlink) => (
							<div key={link.name}>
								{link.dropdownItems ? (
									<div className="space-y-1">
										<input
											type="checkbox"
											id={`dropdown-${link.name}`}
											className="peer hidden"
										/>

										<label
											htmlFor={`dropdown-${link.name}`}
											className="flex cursor-pointer items-center justify-between -mx-3 px-3 py-2 text-base text-gray-900"
										>
											<span>{link.name}</span>
											<svg
												className="h-4 w-4 transition-transform duration-300 peer-checked:rotate-180"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth="2"
												stroke="currentColor"
											>
												<title>Arrow</title>
												<path
													d="M6 9l6 6 6-6"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</label>

										<div className="max-h-0 overflow-hidden transition-all duration-300 peer-checked:max-h-40">
											{link.dropdownItems.map((dropdownItem) => (
												<NavbarLink
													key={dropdownItem.name}
													href={dropdownItem.href as Route}
													className="-mx-3 block px-3 py-2 text-base text-gray-700"
												>
													{dropdownItem.name}
												</NavbarLink>
											))}
										</div>
									</div>
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

						<div className="mt-6 space-y-2">
							{ACTION_BUTTONS.map((button) => (
								<Link
									key={button.name}
									href={button.href as Route}
									className={`block w-full text-center text-base font-medium py-2 px-6 rounded-full transition-colors ${
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
				</dialog>
			</header>
		</div>
	);
};
