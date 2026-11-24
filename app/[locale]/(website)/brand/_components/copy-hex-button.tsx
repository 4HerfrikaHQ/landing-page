"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const COPIED_RESET_MS = 2000;

export function CopyHexButton({ hex }: { hex: string }) {
	const t = useTranslations("brand.colours");
	const [copied, setCopied] = useState(false);
	const timer = useRef<number | undefined>(undefined);

	useEffect(() => () => window.clearTimeout(timer.current), []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(hex);
		} catch {
			return;
		}
		setCopied(true);
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
	};

	return (
		<>
			<button
				type="button"
				onClick={copy}
				aria-label={t("copyHex", { hex })}
				className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-mono text-sm font-medium text-secondary-500 press hover:bg-surface-indigo focus-visible:ring-2 focus-visible:ring-primary-500"
			>
				{hex}
				{copied ? (
					<Check aria-hidden="true" className="size-4 text-primary-500" />
				) : (
					<Copy aria-hidden="true" className="size-4 text-muted-foreground" />
				)}
				{copied && (
					<span aria-hidden="true" className="font-sans text-primary-500">
						{t("copied")}
					</span>
				)}
			</button>
			<output aria-live="polite" className="sr-only">
				{copied ? t("copied") : ""}
			</output>
		</>
	);
}
