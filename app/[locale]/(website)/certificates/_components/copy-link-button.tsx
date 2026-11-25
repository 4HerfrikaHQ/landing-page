"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const RESET_MS = 2500;

type CopyState = "idle" | "copied" | "failed";

export function CopyLinkButton({
	url,
	className,
}: {
	url: string;
	className: string;
}) {
	const t = useTranslations("certificates.share");
	const [state, setState] = useState<CopyState>("idle");

	useEffect(() => {
		if (state === "idle") return;
		const timer = setTimeout(() => setState("idle"), RESET_MS);
		return () => clearTimeout(timer);
	}, [state]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			setState("copied");
		} catch {
			setState("failed");
		}
	}

	const label = t(state === "copied" ? "copied" : "copyLink");
	const announcement = {
		idle: "",
		copied: t("copied"),
		failed: t("copyFailed"),
	}[state];

	return (
		<>
			<button type="button" onClick={copy} className={className}>
				{label}
			</button>
			<output className="sr-only">{announcement}</output>
		</>
	);
}
