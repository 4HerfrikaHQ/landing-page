"use client";

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
			className={`text-sm leading-6 text-gray-900 hover:text-gray-800  ${className}`}
			data-active={pathname === href}
			{...props}
		>
			{children}
		</Link>
	);
};
