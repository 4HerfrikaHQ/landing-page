"use client";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/src/auth";
import { cn } from "@/utils/cn";
import {
	BarChart3,
	CalendarDays,
	LayoutDashboard,
	LogOut,
	type LucideIcon,
	Menu,
	User,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const NAV_ITEMS: {
	key: string;
	label: string;
	href: Route;
	icon: LucideIcon;
}[] = [
	{
		key: "overview",
		label: "Overview",
		href: "/dashboard/mentor" as Route,
		icon: LayoutDashboard,
	},
	{
		key: "profile",
		label: "Profile",
		href: "/dashboard/mentor/profile" as Route,
		icon: User,
	},
	{
		key: "availability",
		label: "Availability",
		href: "/dashboard/mentor/availability" as Route,
		icon: CalendarDays,
	},
	{
		key: "bookings",
		label: "Bookings",
		href: "/dashboard/mentor/bookings" as Route,
		icon: CalendarDays,
	},
	{
		key: "mentees",
		label: "Mentees",
		href: "/dashboard/mentor/mentees" as Route,
		icon: Users,
	},
	{
		key: "stats",
		label: "Stats",
		href: "/dashboard/mentor/stats" as Route,
		icon: BarChart3,
	},
];

export function MentorHeader({
	showAdminPortal = false,
}: {
	showAdminPortal?: boolean;
}) {
	const pathname = usePathname();
	const [isSigningOut, startSignOutTransition] = useTransition();
	const [mobileOpen, setMobileOpen] = useState(false);

	function activeKey() {
		const segments = pathname.split("/").filter(Boolean);
		const mentorIdx = segments.indexOf("mentor");
		const next = mentorIdx >= 0 ? segments[mentorIdx + 1] : undefined;
		return next ?? "overview";
	}

	const active = activeKey();

	function handleLogout() {
		startSignOutTransition(async () => {
			await logout();
		});
	}

	return (
		<header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur-sm">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: brand + nav */}
				<div className="flex items-center gap-6">
					<Link href={"/" as Route} className="shrink-0 no-underline">
						<Image
							src="/assets/icons/4herfrika-logo.svg"
							alt="4HerFrika"
							width={120}
							height={34}
							className="h-8 w-auto"
						/>
					</Link>

					<nav className="hidden items-center gap-1 lg:flex">
						{NAV_ITEMS.map((item) => {
							const isActive = item.key === active;
							const Icon = item.icon;
							return (
								<Link
									key={item.key}
									href={item.href}
									data-active={isActive}
									className={cn(
										"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium no-underline transition-colors",
										isActive
											? "bg-surface-pink text-primary-500"
											: "text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									<Icon className="size-4" />
									{item.label}
								</Link>
							);
						})}
					</nav>
				</div>

				{/* Right: sign out + mobile trigger */}
				<div className="flex items-center gap-2">
					{showAdminPortal ? (
						<Link
							href={"/dashboard/admin" as Route}
							className="hidden rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:border-primary-500 hover:text-primary-500 sm:inline-flex"
						>
							Admin portal
						</Link>
					) : null}
					<button
						type="button"
						onClick={handleLogout}
						disabled={isSigningOut}
						className="hidden items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 sm:inline-flex"
					>
						<LogOut className="size-4" />
						{isSigningOut ? "Signing out…" : "Sign out"}
					</button>

					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger
							render={
								<button
									type="button"
									aria-label="Open menu"
									className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
								/>
							}
						>
							<Menu className="size-5" />
						</SheetTrigger>
						<SheetContent side="right" className="w-72">
							<SheetTitle className="px-4 pt-4">Mentor portal</SheetTitle>
							<nav className="flex flex-col gap-1 px-2 py-2">
								{showAdminPortal ? (
									<SheetClose
										render={
											<Link
												href={"/dashboard/admin" as Route}
												className="mb-2 inline-flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-sm font-medium text-foreground no-underline transition-colors hover:border-primary-500 hover:text-primary-500"
											/>
										}
									>
										Admin portal
									</SheetClose>
								) : null}
								{NAV_ITEMS.map((item) => {
									const isActive = item.key === active;
									const Icon = item.icon;
									return (
										<SheetClose
											key={item.key}
											render={
												<Link
													href={item.href}
													data-active={isActive}
													className={cn(
														"inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors",
														isActive
															? "bg-surface-pink text-primary-500"
															: "text-foreground hover:bg-muted",
													)}
												/>
											}
										>
											<Icon className="size-4" />
											{item.label}
										</SheetClose>
									);
								})}
							</nav>
							<div className="mt-auto border-t border-border/60 p-4">
								<button
									type="button"
									onClick={handleLogout}
									disabled={isSigningOut}
									className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:opacity-50"
								>
									<LogOut className="size-4" />
									{isSigningOut ? "Signing out…" : "Sign out"}
								</button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
