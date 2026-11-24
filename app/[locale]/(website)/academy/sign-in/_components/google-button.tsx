"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { continueWithGoogle } from "../_actions";
import { AuthError } from "./auth-error";

export function GoogleButton({ next }: { next: string }) {
	const t = useTranslations("academyAuth.signIn");
	const google = useAction(continueWithGoogle);
	const busy = google.isPending || google.hasSucceeded;
	const label = busy ? t("googleOpening") : t("google");

	return (
		<div className="flex flex-col gap-3">
			<Button
				type="button"
				variant="outline"
				size="lg"
				disabled={busy}
				onClick={() => google.execute({ next })}
				className="h-12 w-full gap-3 border-input py-0 text-base text-foreground hover:bg-muted hover:text-foreground md:py-0 md:text-base"
			>
				<GoogleMark />
				{label}
			</Button>
			<AuthError message={google.result.serverError} id="google-error" />
		</div>
	);
}

function GoogleMark() {
	return (
		<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
			<path
				fill="#FFC107"
				d="M43.6 20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"
			/>
			<path
				fill="#FF3D00"
				d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
			/>
			<path
				fill="#4CAF50"
				d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
			/>
			<path
				fill="#1976D2"
				d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-4z"
			/>
		</svg>
	);
}
