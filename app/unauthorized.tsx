import FourHerfrikaLogo from "@/app/[locale]/(website)/4herfrika-logo";
import { createClient, logout } from "@/src/auth";
import { CONTACT_EMAIL } from "@/src/lib/contact";
import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

const PILL =
	"inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-white px-6 font-medium ring-1 ring-border outline-none hover:ring-primary hover:no-underline focus-visible:ring-2 focus-visible:ring-primary";

async function signedInEmail() {
	const supabase = await createClient();
	const { data } = await supabase.auth.getUser();
	return data.user?.email ?? null;
}

async function SignedInChip({ email }: { email: string }) {
	const t = await getTranslations("unauthorized");

	return (
		<div className="mt-3 inline-flex max-w-full items-center gap-3 rounded-pill bg-white py-2 pl-2 pr-4 text-sm shadow-xs ring-1 ring-border">
			<span
				aria-hidden="true"
				className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-surface-indigo font-semibold uppercase text-secondary"
			>
				{email.slice(0, 1)}
			</span>
			<span className="min-w-0 truncate">
				{t.rich("signedInAs", {
					email,
					b: (chunks) => <b className="font-semibold">{chunks}</b>,
				})}
			</span>
		</div>
	);
}

async function BackToSite() {
	const t = await getTranslations("unauthorized");

	return (
		<Link href={"/" as Route} className={PILL}>
			<ArrowLeft className="size-4" aria-hidden="true" />
			{t("backToSite")}
		</Link>
	);
}

async function StaffActions({ email }: { email: string | null }) {
	const t = await getTranslations("unauthorized");

	if (!email) {
		return (
			<>
				<Link href={"/dashboard/login" as Route} className={PILL}>
					{t("staffSignIn")}
				</Link>
				<BackToSite />
			</>
		);
	}

	return (
		<>
			<form action={logout}>
				<button
					type="submit"
					className={`${PILL} w-full cursor-pointer sm:w-auto`}
				>
					{t("staffCta")}
				</button>
			</form>
			<BackToSite />
		</>
	);
}

async function SignedInStatus({ email }: { email: string | null }) {
	if (!email) return null;
	return <SignedInChip email={email} />;
}

export default async function UnauthorizedPage() {
	const [t, email] = await Promise.all([
		getTranslations("unauthorized"),
		signedInEmail(),
	]);

	const body = email ? t("body") : t("bodySignedOut");

	return (
		<main className="min-h-screen overflow-x-clip bg-muted text-foreground">
			<header className="px-4 pt-6 lg:px-20">
				<div className="mx-auto max-w-6xl">
					<a
						href="/"
						aria-label={t("logoAlt")}
						className="inline-flex min-h-11 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
					>
						<FourHerfrikaLogo alt="" className="h-9 w-auto" />
					</a>
				</div>
			</header>
			<div className="px-4 pb-16 pt-8 lg:px-20 lg:pb-24 lg:pt-12">
				<div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-8">
					<div className="lg:col-start-1 lg:row-start-1 lg:self-end">
						<span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-primary/20 lg:size-16 lg:rounded-3xl">
							<ShieldAlert className="size-7 lg:size-8" aria-hidden="true" />
						</span>
						<p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-primary lg:mt-6">
							{t("eyebrow")}
						</p>
						<h1 className="mt-3 break-words text-[36px] font-semibold leading-[1.08] tracking-tight sm:text-[38px] lg:text-[60px]">
							{t("titleLead")}
							<br />
							<em className="font-playfair font-black text-primary-500">
								{t("titleAccent")}
							</em>
						</h1>
						<p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-muted-foreground lg:text-lg">
							{body}
						</p>
					</div>

					<aside
						aria-labelledby="learner-title"
						className="overflow-hidden rounded-[20px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:rounded-[40px]"
					>
						<div className="relative hidden aspect-[16/10] lg:block">
							<Image
								src="/assets/academy/hero-source.jpg"
								alt={t("photoAlt")}
								fill
								sizes="560px"
								className="object-cover"
							/>
						</div>
						<div className="p-6 lg:p-10">
							<span className="inline-flex rounded-pill bg-surface-pink px-3 py-1.5 text-xs font-medium text-primary">
								{t("learnerBadge")}
							</span>
							<h2
								id="learner-title"
								className="mt-4 text-2xl font-semibold leading-snug lg:text-[32px]"
							>
								{t("learnerTitle")}
							</h2>
							<p className="mt-3 text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]">
								{t("learnerBody")}
							</p>
							<Link
								href={"/academy/sign-in" as Route}
								className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary px-7 font-medium text-primary-foreground outline-none hover:brightness-90 hover:no-underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
							>
								{t("learnerCta")}
								<ArrowRight className="size-5" aria-hidden="true" />
							</Link>
						</div>
					</aside>

					<div className="lg:col-start-1 lg:row-start-2 lg:self-start">
						<p className="text-sm font-semibold text-muted-foreground">
							{t("staffLabel")}
						</p>
						<SignedInStatus email={email} />
						<div className="mt-3 flex flex-col gap-3 sm:flex-row">
							<StaffActions email={email} />
						</div>
						<p className="mt-5 text-sm text-muted-foreground">
							{t("needAccess")}{" "}
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-2"
							>
								{CONTACT_EMAIL}
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
