"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, ViewTransition } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
	const pathname = usePathname();

	return (
		<ViewTransition
			key={pathname}
			enter="page-enter"
			exit="page-exit"
			default="none"
		>
			<div className="site-page">{children}</div>
		</ViewTransition>
	);
}
