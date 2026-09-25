import FourHerfrikaLogo from "@/app/[locale]/(website)/4herfrika-logo";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ email?: string | string[] }>;
}) {
	const { email } = await searchParams;

	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-surface-pink via-white to-white px-4 py-16">
			<div className="relative mx-auto flex w-full max-w-md flex-col items-center">
				<a href="/" aria-label="4HerFrika home">
					<FourHerfrikaLogo className="h-10 w-auto" />
				</a>

				<div className="mt-10 w-full rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
					<LoginForm defaultEmail={typeof email === "string" ? email : ""} />
				</div>

				<p className="mt-8 text-center text-sm text-muted-foreground">
					Trouble signing in? Email us at{" "}
					<a
						href="mailto:4herfrika@gmail.com?subject=Help%20signing%20in"
						className="font-medium text-primary-500 underline-offset-4 hover:underline"
					>
						4herfrika@gmail.com
					</a>
				</p>
			</div>
		</main>
	);
}
