import type { Route } from "next";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4">
			{/* soft brand glow */}
			<div className="pointer-events-none absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />

			<div className="relative w-full max-w-md text-center">
				<span className="mx-auto mb-7 flex size-20 items-center justify-center rounded-3xl bg-surface-pink text-primary-500 ring-1 ring-primary-500/20">
					<ShieldAlert className="size-10" strokeWidth={1.75} />
				</span>

				<p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">
					Error 403
				</p>
				<h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
					Access denied
				</h1>
				<p className="mx-auto mt-3 max-w-sm text-muted-foreground">
					You don&apos;t have permission to view this page. If you think this is
					a mistake, sign in with an account that has access.
				</p>

				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Link
						href="/dashboard/login"
						className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-sm font-medium text-white shadow-[0_4px_14px_rgba(236,0,140,0.3)] transition-colors hover:bg-primary-600"
					>
						Sign in
					</Link>
					<Link
						href={"/" as Route}
						className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-white px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary-500 hover:text-primary-500"
					>
						<ArrowLeft className="size-4" />
						Back to site
					</Link>
				</div>
			</div>
		</main>
	);
}
