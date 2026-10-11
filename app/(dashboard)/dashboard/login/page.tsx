import FourHerfrikaLogo from "@/app/[locale]/(website)/4herfrika-logo";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Image from "next/image";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{
		email?: string | string[];
		locale?: string | string[];
	}>;
}) {
	const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
	const requested = params.locale ?? cookieStore.get("NEXT_LOCALE")?.value;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;
	const [t, messages] = await Promise.all([
		getTranslations({ locale, namespace: "mentorAuth.login" }),
		getMessages({ locale }),
	]);
	const email = typeof params.email === "string" ? params.email : "";

	return (
		<div lang={locale} className="grid min-h-screen lg:grid-cols-[40%_60%]">
			<div className="relative hidden flex-col justify-between overflow-hidden bg-secondary-500 p-12 lg:flex">
				<div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary-500 opacity-10" />
				<div className="absolute right-0 bottom-0 size-80 translate-x-1/3 translate-y-1/3 rounded-full bg-primary-500 opacity-[0.07]" />
				<div className="absolute top-1/2 -right-12 size-48 rounded-full bg-primary-100 opacity-10" />

				<a href="/" aria-label="4HerFrika home" className="relative z-10">
					<Image
						src="/assets/nameless-logo-white.png"
						alt="4HerFrika"
						width={140}
						height={40}
						className="object-contain"
					/>
				</a>

				<div className="relative z-10 space-y-4">
					<div className="h-1 w-10 rounded-full bg-primary-500" />
					<h2 className="text-4xl leading-tight font-bold text-white">
						{t("panelTitle")}
						<br />
						<span className="text-primary-500">{t("panelAccent")}</span>
					</h2>
					<p className="max-w-xs text-sm leading-relaxed text-white/60">
						{t("panelDescription")}
					</p>
				</div>
			</div>

			<main className="flex flex-col items-center bg-gradient-to-b from-surface-pink via-white to-white px-4 py-16 lg:justify-center lg:bg-none lg:bg-white">
				<div className="w-full max-w-md">
					<a
						href="/"
						aria-label="4HerFrika home"
						className="mb-10 flex justify-center lg:hidden"
					>
						<FourHerfrikaLogo className="h-10 w-auto" />
					</a>

					<div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8 lg:border-0 lg:p-0 lg:shadow-none">
						<NextIntlClientProvider
							locale={locale}
							messages={{ mentorAuth: messages.mentorAuth }}
						>
							<LoginForm defaultEmail={email} />
						</NextIntlClientProvider>
					</div>

					<p className="mt-8 text-center text-sm text-muted-foreground lg:text-left">
						{t("trouble")}{" "}
						<a
							href="mailto:4herfrika@gmail.com?subject=Help%20signing%20in"
							className="font-medium text-primary-500 underline-offset-4 hover:underline"
						>
							4herfrika@gmail.com
						</a>
					</p>
				</div>
			</main>
		</div>
	);
}
