"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center font-normal whitespace-nowrap transition-all duration-300 outline-none select-none hover:no-underline disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				solid: "text-white bg-primary-500 hover:brightness-90",
				outline:
					"text-primary-500 border border-primary-500 hover:text-white hover:bg-primary-500",
				"outline-white":
					"text-white border border-white hover:border-primary-500 hover:bg-primary-500",
				ghost: "hover:bg-muted hover:text-foreground",
				link: "text-primary-500 underline-offset-4 hover:underline",
			},
			size: {
				default:
					"px-3 py-2 lg:px-8 lg:py-4 text-[10px] lg:text-xl rounded-full leading-none",
				sm: "px-4 py-2 text-sm rounded-full",
				lg: "px-8 py-3 md:py-4 text-base md:text-xl rounded-full",
				icon: "size-8 rounded-full",
				"icon-sm": "size-7 rounded-full",
			},
		},
		defaultVariants: {
			variant: "solid",
			size: "default",
		},
	},
);

type ButtonProps = VariantProps<typeof buttonVariants> &
	Omit<ButtonPrimitive.Props, "className"> & {
		href?: Route | string;
		isExternal?: boolean;
		children?: ReactNode;
		className?: string;
	};

function Button({
	variant = "solid",
	size = "default",
	className: _className,
	children,
	href,
	isExternal,
	...props
}: ButtonProps) {
	const className = cn(buttonVariants({ variant, size }), _className);

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
			<Link href={href as Route} className={className} {...(props as Omit<ComponentProps<typeof Link>, "href" | "className">)}>
				{children}
			</Link>
		);
	}

	return (
		<ButtonPrimitive className={className} {...props}>
			{children}
		</ButtonPrimitive>
	);
}

export { Button, buttonVariants };
