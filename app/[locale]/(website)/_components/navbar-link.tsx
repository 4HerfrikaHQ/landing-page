"use client";

import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

/**
 * A link in the navbar.
 *
 * Takes all the props of an anchor element.
 */
export const NavbarLink: FC<React.ComponentProps<typeof Link>> = ({
	href,
	className,
	children,
	...props
}) => {
	const pathname = usePathname();
	return (
		<Link
			href={href ?? "/"}
			className={cn(
				"text-sm leading-6 text-foreground hover:text-foreground",
				className,
			)}
			data-active={pathname === href}
			{...props}
		>
			{children}
		</Link>
	);
};
