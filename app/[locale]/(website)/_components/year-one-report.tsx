"use client";
import { useTranslations } from "next-intl";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function YearOneReport() {
	const pathname = usePathname();
	const t = useTranslations("common");
	if (pathname === "/impact") return null;

	return (
		<Link
			href={"/impact" as Route}
			aria-label={t("yearOneReport")}
			className="sticky top-0 z-50 block w-full group"
		>
			<div className="h-14 w-full bg-primary-500 text-white flex items-center justify-center text-sm sm:text-base font-medium cursor-pointer select-none hover:underline">
				<span className="animate-pulse group-hover:animate-none">
					{t("yearOneReport")}
				</span>
			</div>
		</Link>
	);
}
