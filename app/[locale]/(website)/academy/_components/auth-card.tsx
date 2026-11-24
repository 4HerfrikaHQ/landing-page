import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
	return (
		<main className="flex flex-col bg-linear-to-b from-surface-pink via-white to-white px-5 pt-8 pb-16 sm:items-center sm:pt-16 sm:pb-24">
			<div className="w-full max-w-120 sm:rounded-3xl sm:bg-white sm:p-10 sm:shadow-[0_8px_40px_rgba(236,0,140,0.08)]">
				{children}
			</div>
		</main>
	);
}
