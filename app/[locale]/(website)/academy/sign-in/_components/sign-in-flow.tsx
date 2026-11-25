"use client";

import { type ReactNode, useState } from "react";
import { CodeStep } from "./code-step";
import { EmailStep, type SentCode } from "./email-step";

export function SignInFlow({
	next,
	callbackFailed,
	google,
}: { next: string; callbackFailed: boolean; google: ReactNode }) {
	const [sent, setSent] = useState<SentCode | null>(null);

	if (!sent) {
		return (
			<EmailStep
				next={next}
				callbackFailed={callbackFailed}
				google={google}
				onSent={setSent}
			/>
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
