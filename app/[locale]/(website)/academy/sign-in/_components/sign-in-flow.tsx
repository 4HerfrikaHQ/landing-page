"use client";

import { useState } from "react";
import { CodeStep } from "./code-step";
import { EmailStep, type SentCode } from "./email-step";

export function SignInFlow({
	next,
	callbackFailed,
}: { next: string; callbackFailed: boolean }) {
	const [sent, setSent] = useState<SentCode | null>(null);

	if (!sent) {
		return (
			<EmailStep next={next} callbackFailed={callbackFailed} onSent={setSent} />
		);
	}

	return (
		<CodeStep
			sent={sent}
			next={next}
			onResent={(resendAt) => setSent({ ...sent, resendAt })}
			onChangeEmail={() => setSent(null)}
		/>
	);
}
