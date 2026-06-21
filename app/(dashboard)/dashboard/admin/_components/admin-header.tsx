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
	CalendarDays,
	FileText,
	LogOut,
	type LucideIcon,
	Menu,
	Shield,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const SEGMENT_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	admin: "Admin",
	mentors: "Mentors",
	admins: "Admins",
	applications: "Applications",
	bookings: "Bookings",
};

const NAV_ITEMS: {
	key: string;
	label: string;
	href: Route;
	icon: LucideIcon;
}[] = [
	{
		key: "mentors",
		label: "Mentors",
		href: "/dashboard/admin/mentors" as Route,
		icon: Users,
	},
	{
		key: "bookings",
		label: "Bookings",
		href: "/dashboard/admin/bookings" as Route,
		icon: CalendarDays,
	},
	{
		key: "applications",
		label: "Applications",
		href: "/dashboard/admin/applications" as Route,
		icon: FileText,
	},
	{
		key: "admins",
		label: "Admins",
		href: "/dashboard/admin/admins" as Route,
		icon: Shield,
	},
];

export function AdminHeader() {
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const [mobileOpen, setMobileOpen] = useState(false);

	// Build breadcrumb segments from the path, starting at "admin"
	// e.g. /dashboard/admin/mentors → [admin, mentors]
	const segments = pathname.split("/").filter(Boolean);
	const adminIndex = segments.indexOf("admin");

	const visibleSegments =
		adminIndex >= 0 ? segments.slice(adminIndex) : segments;

	const crumbs = visibleSegments.map((seg, i) => {
		const href = `/${segments.slice(0, adminIndex + i + 1).join("/")}`;
		const label = SEGMENT_LABELS[seg] ?? seg;
		const isLast = i === visibleSegments.length - 1;
		return { href, label, isLast };
	});

	const activeKey = adminIndex >= 0 ? segments[adminIndex + 1] : undefined;

	function handleLogout() {
		startTransition(async () => {
			await logout();
		});
	}

	return (
		<header className="sticky top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur-sm">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: brand + breadcrumb */}
				<div className="flex min-w-0 items-center gap-4">
					<Link href={"/" as Route} className="shrink-0 no-underline">
						<Image
							src="/assets/icons/4herfrika-logo.svg"
							alt="4HerFrika"
							width={120}
							height={34}
							className="h-8 w-auto"
						/>
					</Link>
					<span className="hidden h-6 w-px bg-border sm:block" />
					<nav className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
						{crumbs.map((crumb, i) => (
							<span
								key={crumb.href}
								className="flex min-w-0 items-center gap-1.5"
							>
								{i > 0 && <span className="text-border">/</span>}
								{crumb.isLast ? (
									<span className="truncate font-medium text-foreground">
										{crumb.label}
									</span>
								) : (
									<Link
										href={crumb.href as Route}
										className="truncate text-muted-foreground no-underline transition-colors hover:text-foreground"
									>
										{crumb.label}
									</Link>
								)}
							</span>
						))}
					</nav>
				</div>

				{/* Right: nav + sign out + mobile trigger */}
				<div className="flex items-center gap-2">
					<nav className="hidden items-center gap-1 lg:flex">
						{NAV_ITEMS.map((item) => {
							const isActive = item.key === activeKey;
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

					<span className="hidden h-6 w-px bg-border lg:block" />

					<button
						type="button"
						onClick={handleLogout}
						disabled={isPending}
						className="hidden items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 sm:inline-flex"
					>
						<LogOut className="size-4" />
						{isPending ? "Signing out…" : "Sign out"}
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
							<SheetTitle className="px-4 pt-4">Admin</SheetTitle>
							<nav className="flex flex-col gap-1 px-2 py-2">
								{NAV_ITEMS.map((item) => {
									const isActive = item.key === activeKey;
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
									disabled={isPending}
									className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:opacity-50"
								>
									<LogOut className="size-4" />
									{isPending ? "Signing out…" : "Sign out"}
								</button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
