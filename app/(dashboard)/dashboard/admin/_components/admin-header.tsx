"use client";

import { logout } from "@/src/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

const SEGMENT_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	admin: "Admin",
	mentors: "Mentors",
	admins: "Admins",
};

export function AdminHeader() {
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	// Build breadcrumb segments from the path, starting at "admin"
	// e.g. /dashboard/admin/mentors → [admin, mentors]
	const segments = pathname.split("/").filter(Boolean);
	const adminIndex = segments.indexOf("admin");

	const visibleSegments = adminIndex >= 0 ? segments.slice(adminIndex) : segments;

	const crumbs = visibleSegments.map((seg, i) => {
		const href = "/" + segments.slice(0, adminIndex + i + 1).join("/");
		const label = SEGMENT_LABELS[seg] ?? seg;
		const isLast = i === visibleSegments.length - 1;
		return { href, label, isLast };
	});

	function handleLogout() {
		startTransition(async () => {
			await logout();
		});
	}

	return (
		<header className="sticky top-0 z-10 flex items-center justify-between h-11 px-8 border-b bg-white/90 backdrop-blur-sm">
			<nav className="flex items-center gap-1.5 text-sm">
				{crumbs.map((crumb, i) => (
					<span key={crumb.href} className="flex items-center gap-1.5">
						{i > 0 && <span className="text-gray-300">/</span>}
						{crumb.isLast ? (
							<span className="text-gray-900 font-medium">{crumb.label}</span>
						) : (
							<Link
								href={crumb.href}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								{crumb.label}
							</Link>
						)}
					</span>
				))}
			</nav>

			<button
				onClick={handleLogout}
				disabled={isPending}
				className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
			>
				{isPending ? "Signing out…" : "Sign out"}
			</button>
		</header>
	);
}
