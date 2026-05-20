import type { Route } from "next";
import Link from "next/link";

export function MentorSubpageHeader({
	active,
}: { active: "bookings" | "mentees" | "stats" }) {
	const items: { key: typeof active; label: string; href: Route }[] = [
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

	return (
		<header className="sticky top-0 z-10 flex items-center justify-between h-11 px-8 border-b bg-white/90 backdrop-blur-sm">
			<div className="flex items-center gap-4 text-sm">
				<span className="font-medium text-gray-400">Mentor Portal</span>
				<nav className="flex items-center gap-3 text-xs">
					<Link
						href="/dashboard/mentor"
						className="text-gray-400 hover:text-gray-600"
					>
						Profile
					</Link>
					{items.map((i) => (
						<Link
							key={i.key}
							href={i.href}
							className={
								i.key === active
									? "text-gray-900 font-medium"
									: "text-gray-400 hover:text-gray-600"
							}
						>
							{i.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
