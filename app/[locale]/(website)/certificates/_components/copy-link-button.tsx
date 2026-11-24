"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

const RESET_MS = 2500;

export function CopyLinkButton({
	url,
	className,
}: {
	url: string;
	className: string;
}) {
	const t = useTranslations("certificates.share");
	const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			setState("copied");
		} catch {
			setState("failed");
		}
		setTimeout(() => setState("idle"), RESET_MS);
	}

	return (
		<>
			<button type="button" onClick={copy} className={className}>
				{t(state === "copied" ? "copied" : "copyLink")}
			</button>
			<output className="sr-only">
				{state === "idle"
					? ""
					: t(state === "copied" ? "copied" : "copyFailed")}
			</output>
		</>
	);
}
