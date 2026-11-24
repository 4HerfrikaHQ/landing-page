import { Link } from "@/i18n/navigation";
import { verifyUnsubscribeToken } from "@/src/lib/email-unsubscribe";
import { Bell, Check, LinkIcon, MailX, X } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ResubscribeButton } from "./_components/resubscribe-button";
import { UnsubscribeButton } from "./_components/unsubscribe-button";
import {
	PILL_OUTLINE,
	PILL_PRIMARY,
	UnsubscribeCard,
} from "./_components/unsubscribe-card";

const CONTACT_EMAIL = "hello@4herfrika.org";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: "unsubscribe",
	});
	return {
		title: `${t("metaTitle")} | 4Herfrika`,
		robots: { index: false, follow: false },
	};
}

const boldEmail = (chunks: ReactNode) => (
	<b className="font-semibold text-foreground">{chunks}</b>
);

const BODY =
	"mt-4 text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]";

export default async function UnsubscribePage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		e?: string;
		t?: string;
		done?: string;
		resubscribed?: string;
		error?: string;
	}>;
}) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const [sp, t] = await Promise.all([
		searchParams,
		getTranslations("unsubscribe"),
	]);

	const { e, t: token } = sp;
	const valid = e && token ? verifyUnsubscribeToken(e, token) : false;

	if (sp.done) {
		return (
			<UnsubscribeCard
				icon={<Check className="size-7" aria-hidden="true" />}
				iconClassName="bg-green-700/10 text-green-800"
				eyebrow={t("done.eyebrow")}
				eyebrowClassName="text-green-800"
				titleLead={t("done.titleLead")}
				titleAccent={t("done.titleAccent")}
			>
				<p className={BODY}>{t("done.body")}</p>
				{valid && e && token ? (
					<div className="mt-6 flex flex-col gap-4 rounded-2xl bg-surface-pink p-5 sm:flex-row sm:items-center">
						<div className="flex-1">
							<p className="font-semibold">{t("done.oopsTitle")}</p>
							<p className="mt-0.5 text-[15px] text-muted-foreground">
								{t("done.oopsBody")}
							</p>
						</div>
						<ResubscribeButton e={e} t={token} />
					</div>
				) : null}
				<p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
					{t("done.hereLabel")}
				</p>
				<div className="mt-3 grid gap-3 sm:grid-cols-2">
					<Link
						href="/careercorner"
						className="flex min-h-14 items-center justify-between rounded-2xl border border-border px-4 font-medium hover:border-primary hover:no-underline"
					>
						{t("done.findMentor")}
						<span className="text-primary" aria-hidden="true">
							→
						</span>
					</Link>
					<Link
						href="/academy"
						className="flex min-h-14 items-center justify-between rounded-2xl border border-border px-4 font-medium hover:border-primary hover:no-underline"
					>
						{t("done.academy")}
						<span className="text-primary" aria-hidden="true">
							→
						</span>
					</Link>
				</div>
			</UnsubscribeCard>
		);
	}

	if (!valid || !e || !token || sp.error) {
		return (
			<UnsubscribeCard
				icon={<LinkIcon className="size-7" aria-hidden="true" />}
				iconClassName="bg-muted text-muted-foreground"
				eyebrow={t("invalid.eyebrow")}
				eyebrowClassName="text-muted-foreground"
				titleLead={t("invalid.titleLead")}
				titleAccent={t("invalid.titleAccent")}
			>
				<p className={BODY}>{t("invalid.body")}</p>
				<div className="mt-6 rounded-2xl bg-surface-indigo p-5 text-[15px]">
					<p className="font-semibold">{t("invalid.stillTitle")}</p>
					<p className="mt-1 text-muted-foreground">
						{t.rich("invalid.stillBody", {
							email: CONTACT_EMAIL,
							mail: (chunks) => (
								<a
									href={`mailto:${CONTACT_EMAIL}`}
									className="font-medium text-primary underline underline-offset-2"
								>
									{chunks}
								</a>
							),
						})}
					</p>
				</div>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link href="/" className={PILL_OUTLINE}>
						{t("backToHome")}
					</Link>
				</div>
			</UnsubscribeCard>
		);
	}

	if (sp.resubscribed) {
		return (
			<UnsubscribeCard
				icon={<Bell className="size-7" aria-hidden="true" />}
				iconClassName="bg-amber-300 text-secondary"
				eyebrow={t("resubscribed.eyebrow")}
				eyebrowClassName="text-primary"
				titleLead={t("resubscribed.titleLead")}
				titleAccent={t("resubscribed.titleAccent")}
			>
				<p className={BODY}>
					{t.rich("resubscribed.body", { email: e, b: boldEmail })}
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link href="/careercorner" className={PILL_PRIMARY}>
						{t("resubscribed.bookNext")}
					</Link>
					<Link href="/" className={PILL_OUTLINE}>
						{t("backToHome")}
					</Link>
				</div>
			</UnsubscribeCard>
		);
	}

	return (
		<UnsubscribeCard
			icon={<MailX className="size-7" aria-hidden="true" />}
			iconClassName="bg-surface-pink text-primary"
			eyebrow={t("confirm.eyebrow")}
			eyebrowClassName="text-primary"
			titleLead={t("confirm.titleLead")}
			titleAccent={t("confirm.titleAccent")}
		>
			<p className={BODY}>
				{t.rich("confirm.body", { email: e, b: boldEmail })}
			</p>
			<div className="mt-6 grid gap-3 sm:grid-cols-2">
				<div className="rounded-2xl border border-border p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
						{t("confirm.stopsLabel")}
					</p>
					<p className="mt-2 flex items-start gap-2 text-[15px]">
						<X
							className="mt-0.5 size-4 shrink-0 text-destructive"
							aria-hidden="true"
						/>
						{t("confirm.stopsItem")}
					</p>
					<p className="mt-1 pl-6 text-sm text-muted-foreground">
						{t("confirm.stopsNote")}
					</p>
				</div>
				<div className="rounded-2xl bg-surface-indigo p-4">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">
						{t("confirm.keepsLabel")}
					</p>
					<p className="mt-2 flex items-start gap-2 text-[15px]">
						<Check
							className="mt-0.5 size-4 shrink-0 text-green-700"
							aria-hidden="true"
						/>
						{t("confirm.keepsConfirmations")}
					</p>
					<p className="mt-1 flex items-start gap-2 text-[15px]">
						<Check
							className="mt-0.5 size-4 shrink-0 text-green-700"
							aria-hidden="true"
						/>
						{t("confirm.keepsReminders")}
					</p>
				</div>
			</div>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<UnsubscribeButton e={e} t={token} />
				<Link href="/" className={PILL_OUTLINE}>
					{t("confirm.keep")}
				</Link>
			</div>
		</UnsubscribeCard>
	);
}
