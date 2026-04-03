"use client";

import { sendOtp, verifyOtp } from "@/src/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [step, setStep] = useState<"email" | "otp">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSendOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const { error } = await sendOtp(email);
		setLoading(false);
		if (error) {
			setError(error.message);
			return;
		}
		setStep("otp");
	}

	async function handleVerifyOtp(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const { error } = await verifyOtp(email, otp);
		setLoading(false);
		if (error) {
			setError(error.message);
			return;
		}
		router.push("/dashboard");
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-sm space-y-6">
				<h1 className="text-2xl font-semibold text-center">Sign in</h1>

				{step === "email" ? (
					<form onSubmit={handleSendOtp} className="space-y-4">
						<Input
							type="email"
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Sending..." : "Send code"}
						</Button>
					</form>
				) : (
					<form onSubmit={handleVerifyOtp} className="space-y-4">
						<p className="text-sm text-muted-foreground text-center">
							Enter the code sent to {email}
						</p>
						<Input
							type="text"
							inputMode="numeric"
							placeholder="000000"
							maxLength={6}
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
						/>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Verifying..." : "Verify"}
						</Button>
						<button
							type="button"
							className="text-sm text-muted-foreground w-full text-center underline"
							onClick={() => { setStep("email"); setError(null); }}
						>
							Use a different email
						</button>
					</form>
				)}

				{error && (
					<p className="text-sm text-destructive text-center">{error}</p>
				)}
			</div>
		</div>
	);
}
