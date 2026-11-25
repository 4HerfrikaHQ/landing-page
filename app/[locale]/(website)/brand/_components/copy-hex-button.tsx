"use client";

import { cn } from "@/utils/cn";
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

	const Icon = copied ? Check : Copy;
	const iconClass = copied ? "text-primary-500" : "text-muted-foreground";
	const announcement = copied ? t("copied") : "";

	return (
		<>
			<button
				type="button"
				onClick={copy}
				aria-label={t("copyHex", { hex })}
				className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-mono text-sm font-medium text-secondary-500 press hover:bg-surface-indigo focus-visible:ring-2 focus-visible:ring-primary-500"
			>
				{hex}
				<Icon aria-hidden="true" className={cn("size-4", iconClass)} />
				<span
					aria-hidden="true"
					className={cn(
						"font-sans text-primary-500",
						copied ? "visible" : "invisible",
					)}
				>
					{t("copied")}
				</span>
			</button>
			<output aria-live="polite" className="sr-only">
				{announcement}
			</output>
		</>
	);
}
