import { RollLabel } from "@/components/ui/roll-label";
import { SearchX } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { localizedPath } from "../../academy/sign-in/_helpers";

export const metadata = { robots: { index: false, follow: false } };

export default function CertificateNotFound() {
	const t = useTranslations("certificates.check");
	const locale = useLocale();
	return (
		<main className="bg-surface-indigo/40 px-5 py-16 lg:py-24">
			<div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-[0_12px_32px_rgba(3,6,92,0.08)]">
				<SearchX className="size-10 text-secondary-500" aria-hidden="true" />
				<h1 className="text-2xl font-semibold text-secondary-500">
					{t("notFoundTitle")}
				</h1>
				<p className="text-base text-muted-foreground">{t("notFoundBody")}</p>
				<Link
					href={localizedPath(locale, "/academy") as Route}
					className="press inline-flex min-h-12 items-center justify-center rounded-full border-2 border-primary-700 px-6 py-3 text-base font-semibold text-primary-700 outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-secondary-500"
				>
					<RollLabel>{t("about")}</RollLabel>
				</Link>
			</div>
		</main>
	);
}
