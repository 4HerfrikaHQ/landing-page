"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

export function PrintButton() {
	const t = useTranslations("certificates.print");
	return (
		<button
			type="button"
			onClick={() => window.print()}
			className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-base font-semibold text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-secondary-500"
		>
			<Printer className="size-5" aria-hidden="true" />
			{t("print")}
		</button>
	);
}
