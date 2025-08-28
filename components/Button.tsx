import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import Link, { type LinkProps } from "next/link";

type Props = LinkProps<never> & {
	variant?: "solid" | "outline" | "outline-white";
	className?: string;
	children: ReactNode;
	onClick?: () => void;
	/* Specifies that link routes to a page outside the 4herfrika website */
	isExternal?: boolean;
};

export function Button({
	variant = "solid",
	className: _className,
	href,
	children,
	onClick,
	isExternal,
	...props
}: Props) {
	const className = cn(
		"px-3 py-2 lg:px-8 lg:py-4 text-[10px] lg:text-xl font-normal rounded-[999px] leading-none duration-300 hover:no-underline flex items-center justify-center",
		{
			"text-white bg-primary-500 hover:brightness-90": variant === "solid",
			"text-primary-500 border border-primary-500 hover:text-white hover:bg-primary-500":
				variant === "outline",
			"text-white border border-white hover:border-primary-500 hover:bg-primary-500":
				variant === "outline-white",
		},
		_className,
	);

	if (href) {
		if (isExternal) {
			return (
				<a
					target="_blank"
					href={href.toString()}
					className={className}
					rel="noreferrer"
				>
					{children}
				</a>
			);
		}
		return (
			<Link href={href} className={className} {...props}>
				{children}
			</Link>
		);
	}

	return (
		<button type="button" onClick={onClick} className={className}>
			{children}
		</button>
	);
}
