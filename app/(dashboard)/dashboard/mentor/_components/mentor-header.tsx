"use client";

import { logout } from "@/src/auth";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

const NAV_ITEMS: { key: string; label: string; href: Route }[] = [
	{ key: "overview", label: "Overview", href: "/dashboard/mentor" as Route },
	{
		key: "profile",
		label: "Profile",
		href: "/dashboard/mentor/profile" as Route,
	},
	{
		key: "availability",
		label: "Availability",
		href: "/dashboard/mentor/availability" as Route,
	},
	{
		key: "bookings",
		label: "Bookings",
		href: "/dashboard/mentor/bookings" as Route,
	},
	{
		key: "mentees",
		label: "Mentees",
		href: "/dashboard/mentor/mentees" as Route,
	},
	{ key: "stats", label: "Stats", href: "/dashboard/mentor/stats" as Route },
];

export function MentorHeader() {
	const pathname = usePathname();
	const [isSigningOut, startSignOutTransition] = useTransition();

	function activeKey() {
		// /dashboard/mentor → overview; /dashboard/mentor/<seg> → <seg>
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
		<header className="sticky top-0 z-10 flex items-center justify-between h-11 px-8 border-b bg-white/90 backdrop-blur-sm">
			<div className="flex items-center gap-4 text-sm">
				<span className="font-medium text-gray-400">Mentor Portal</span>
				<nav className="flex items-center gap-3 text-xs">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.key}
							href={item.href}
							className={
								item.key === active
									? "text-gray-900 font-medium"
									: "text-gray-400 hover:text-gray-600"
							}
						>
							{item.label}
						</Link>
					))}
				</nav>
			</div>

			<button
				type="button"
				onClick={handleLogout}
				disabled={isSigningOut}
				className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{isSigningOut ? "Signing out…" : "Sign out"}
			</button>
		</header>
	);
}
