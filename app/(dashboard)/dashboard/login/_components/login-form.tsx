"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { sendOtp, verifyOtp } from "@/src/auth";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 60;

export function LoginForm({ defaultEmail }: { defaultEmail: string }) {
	const [step, setStep] = useState<"email" | "code">("email");
	const [email, setEmail] = useState(defaultEmail);
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resent, setResent] = useState(false);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	async function requestCode() {
		setLoading(true);
		setError(null);
		const result = await sendOtp(email);
		setLoading(false);
		if (result.error) {
			setError(result.error);
			return false;
		}
		setCooldown(RESEND_COOLDOWN_SECONDS);
		return true;
	}

	async function handleEmailSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (await requestCode()) {
			setCode("");
			setResent(false);
			setStep("code");
		}
	}

	async function handleResend() {
		setCode("");
		if (await requestCode()) setResent(true);
	}

	async function submitCode(value: string) {
		setLoading(true);
		setError(null);
		const result = await verifyOtp(email, value);
		setLoading(false);
		if (result?.error) {
			setError(result.error);
			setCode("");
		}
	}

	if (step === "email") {
		return (
			<form onSubmit={handleEmailSubmit} className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						Sign in to your mentor account
					</h1>
					<p className="text-base text-muted-foreground">
						Enter the email address your invite was sent to. We'll email you a
						6-digit code. No password needed.
					</p>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="email"
						className="text-sm font-medium text-foreground"
					>
						Email address
					</label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						inputMode="email"
						autoFocus
						required
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? "login-error" : undefined}
						className="h-12 px-4 text-base md:text-base"
					/>
				</div>

				<ErrorMessage message={error} />

				<Button
					type="submit"
					size="lg"
					disabled={loading}
					className="h-12 w-full text-base md:text-base"
				>
					{loading ? "Sending your code…" : "Email me a code"}
				</Button>
			</form>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
					Check your email
				</h1>
				<p className="text-base text-muted-foreground">
					We sent a 6-digit code to{" "}
					<span className="font-medium text-foreground break-all">{email}</span>
					. Type it below.
				</p>
			</div>

			<div className="flex flex-col items-center gap-3">
				<InputOTP
					maxLength={6}
					pattern={REGEXP_ONLY_DIGITS}
					autoComplete="one-time-code"
					autoFocus
					value={code}
					onChange={setCode}
					onComplete={submitCode}
					disabled={loading}
					aria-label="6-digit code"
					aria-invalid={error ? true : undefined}
					containerClassName="justify-center"
				>
					<InputOTPGroup className="gap-2">
						{Array.from({ length: 6 }, (_, i) => (
							<InputOTPSlot
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
								key={i}
								index={i}
								className="size-11 rounded-lg border text-xl font-medium first:rounded-lg last:rounded-lg sm:size-12"
							/>
						))}
					</InputOTPGroup>
				</InputOTP>
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{loading
						? "Checking your code…"
						: resent
							? "New code sent. Use the newest email."
							: "You'll be signed in as soon as you enter all 6 digits."}
				</p>
			</div>

			<ErrorMessage message={error} />

			<div className="rounded-xl bg-surface-pink/50 px-4 py-3 text-sm text-muted-foreground">
				<p className="font-medium text-foreground">Can't find the email?</p>
				<p className="mt-1">
					It can take a minute to arrive. Check your spam, junk, or promotions
					folder for an email from 4HerFrika.
				</p>
			</div>

			<div className="flex flex-col items-center gap-3 text-sm">
				<button
					type="button"
					onClick={handleResend}
					disabled={loading || cooldown > 0}
					className="font-medium text-primary-500 underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
				>
					{cooldown > 0
						? `Send a new code in ${cooldown}s`
						: "Send me a new code"}
				</button>
				<button
					type="button"
					onClick={() => {
						setStep("email");
						setError(null);
						setCode("");
					}}
					className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				>
					Wrong email? Change it
				</button>
			</div>
		</div>
	);
}

function ErrorMessage({ message }: { message: string | null }) {
	if (!message) return null;
	return (
		<p
			id="login-error"
			role="alert"
			className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
		>
			{message}
		</p>
	);
}
