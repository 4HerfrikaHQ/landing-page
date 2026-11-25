"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function ReportBrokenLink({
	email,
	subject,
}: { email: string; subject: string }) {
	const url = useSyncExternalStore(
		noopSubscribe,
		() => window.location.href,
		() => "",
	);
	const fullSubject = url ? `${subject}: ${url}` : subject;

	return (
		<a
			href={`mailto:${email}?subject=${encodeURIComponent(fullSubject)}`}
			className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-2"
		>
			{email}
		</a>
	);
}
