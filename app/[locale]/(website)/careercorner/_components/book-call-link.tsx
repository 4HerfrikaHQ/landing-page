"use client";

import { trackEvent } from "@/src/lib/analytics";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

type BookCallLinkProps = {
	mentor: { id: string; slug: string; name: string };
	source: "directory" | "featured";
	ariaLabel: string;
	className: string;
	children: ReactNode;
};

export function BookCallLink({
	mentor,
	source,
	ariaLabel,
	className,
	children,
}: BookCallLinkProps) {
	return (
		<Link
			href={`/careercorner/${mentor.slug}` as Route}
			aria-label={ariaLabel}
			onClick={() =>
				trackEvent("mentor_booking_clicked", {
					mentor_id: mentor.id,
					mentor_slug: mentor.slug,
					mentor_name: mentor.name,
					source,
				})
			}
			className={className}
		>
			{children}
		</Link>
	);
}
