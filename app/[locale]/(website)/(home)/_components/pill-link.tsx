import { RollLabel } from "@/components/ui/roll-label";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import type { Route } from "next";
import type { ReactNode } from "react";

const BASE =
	"inline-flex h-12 items-center justify-center rounded-full px-6 font-medium whitespace-nowrap transition-[filter,background-color,color] duration-200 hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-2";

const VARIANTS = {
	solid:
		"bg-primary-500 text-white hover:brightness-90 focus-visible:outline-white",
	"outline-light":
		"border-2 border-white/70 text-white hover:bg-white/10 focus-visible:outline-white",
	"outline-primary":
		"border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus-visible:outline-primary-500",
	bright:
		"bg-primary-bright text-secondary-500 hover:brightness-95 focus-visible:outline-white",
	white:
		"bg-white text-primary-500 hover:bg-white/90 focus-visible:outline-white",
	"outline-white":
		"border-2 border-white text-white hover:bg-white/10 focus-visible:outline-white",
} as const;

type PillLinkProps = {
	href: string;
	variant: keyof typeof VARIANTS;
	external?: boolean;
	className?: string;
	children: ReactNode;
};

export function PillLink({
	href,
	variant,
	external,
	className,
	children,
}: PillLinkProps) {
	const classes = cn(BASE, VARIANTS[variant], className);

	if (external) {
		return (
			<a href={href} target="_blank" rel="noreferrer" className={classes}>
				<RollLabel>{children}</RollLabel>
			</a>
		);
	}

	return (
		<Link href={href as Route} className={classes}>
			<RollLabel>{children}</RollLabel>
		</Link>
	);
}
