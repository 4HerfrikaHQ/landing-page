"use client";

import { sendOtp, verifyOtp } from "@/src/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
	}

	return (
		<div className="min-h-screen grid lg:grid-cols-[40%_60%]">
			{/* Left — branded panel */}
			<div
				className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
				style={{ background: "#03065c" }}
			>
				{/* Decorative circles */}
				<div
					className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
					style={{ background: "#ec008c" }}
				/>
				<div
					className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-[0.07] translate-x-1/3 translate-y-1/3"
					style={{ background: "#ec008c" }}
				/>
				<div
					className="absolute top-1/2 -right-12 w-48 h-48 rounded-full opacity-10"
					style={{ background: "#f700dd" }}
				/>

				{/* Logo */}
				<div className="relative z-10">
					<Image
						src="/assets/nameless-logo-white.png"
						alt="4herfrika"
						width={140}
						height={40}
						className="object-contain"
					/>
				</div>

				{/* Tagline */}
				<div className="relative z-10 space-y-4">
					<div
						className="w-10 h-1 rounded-full"
						style={{ background: "#ec008c" }}
					/>
					<h2 className="text-4xl font-bold text-white leading-tight">
						Mentor
						<br />
						<span style={{ color: "#ec008c" }}>Portal</span>
					</h2>
					<p className="text-white/50 text-sm max-w-xs leading-relaxed">
						Manage your availability, connect with mentees, and track your
						impact on Africa's next generation of tech talent.
					</p>
				</div>
			</div>

			{/* Right — form panel */}
			<div className="flex justify-center pt-32 p-8 bg-white">
				<div className="w-full max-w-sm space-y-8">
					{/* Mobile logo */}
					<div className="lg:hidden">
						<Image
							src="/assets/navbar-logo.png"
							alt="4herfrika"
							width={120}
							height={36}
							className="object-contain"
						/>
					</div>

					<div className="space-y-1">
						<h1 className="text-2xl font-bold text-gray-900">
							{step === "email" ? "Sign in" : "Check your email"}
						</h1>
						<p className="text-sm text-gray-500">
							{step === "email"
								? "Enter your email to receive a sign-in code."
								: `We sent a 6-digit code to ${email}`}
						</p>
					</div>

					{step === "email" ? (
						<form onSubmit={handleSendOtp} className="space-y-4">
							<div className="flex flex-col gap-3">
								<label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
									Email address
								</label>
								<Input
									type="email"
									placeholder="you@4herfrika.org"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="h-12 bg-gray-50 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
								/>
							</div>
							<Button
								type="submit"
								className="w-full h-12 text-sm font-semibold"
								disabled={loading}
								style={{
									background: loading ? "#f100a1" : "#ec008c",
								}}
							>
								{loading ? "Sending…" : "Send code →"}
							</Button>
						</form>
					) : (
						<form onSubmit={handleVerifyOtp} className="space-y-4">
							<div className="flex flex-col gap-3">
								<label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
									6-digit code
								</label>
								<Input
									type="text"
									inputMode="numeric"
									placeholder="000000"
									maxLength={6}
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
									className="h-12 bg-gray-50 border-gray-200 text-center text-xl tracking-[0.5em] font-mono focus:border-primary-500 focus:ring-primary-500"
								/>
							</div>
							<Button
								type="submit"
								className="w-full h-12 text-sm font-semibold"
								disabled={loading}
								style={{
									background: loading ? "#f100a1" : "#ec008c",
								}}
							>
								{loading ? "Verifying…" : "Verify →"}
							</Button>
							<button
								type="button"
								className="text-xs text-gray-400 w-full text-center hover:text-gray-600 transition-colors"
								onClick={() => {
									setStep("email");
									setError(null);
								}}
							>
								← Use a different email
							</button>
						</form>
					)}

					{error && (
						<p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
							{error}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
