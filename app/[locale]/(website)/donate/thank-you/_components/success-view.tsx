import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/src/lib/paystack/amounts";
import { Check, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { type GiftSummary, maskEmail } from "../_lib/outcome";

const SHARE_URL = "https://4herfrika.org/donate";

const SHARE_LINKS = [
	{
		key: "whatsapp",
		href: `https://wa.me/?text=${encodeURIComponent(`I just gave to 4HerFrika ${SHARE_URL}`)}`,
	},
	{
		key: "linkedin",
		href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
	},
	{
		key: "x",
		href: `https://x.com/intent/post?url=${encodeURIComponent(SHARE_URL)}`,
	},
] as const;

const CARD =
	"rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-8";

export async function SuccessView({ gift }: { gift: GiftSummary }) {
	const t = await getTranslations("donate.thanks.success");
	const locale = await getLocale();
	const amount = formatAmount(gift.amount, gift.currency);
	const date = new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeZone: "Africa/Lagos",
	}).format(gift.paidAt ? new Date(gift.paidAt) : new Date());
	const Aside = gift.monthly ? MonthlyAside : OnceAside;

	return (
		<div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-14">
			<div>
				<span className="inline-flex items-center gap-1.5 rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					<Check className="size-3" aria-hidden="true" />
					{t("badge", { date })}
				</span>
				<h1 className="mt-4 text-[38px] font-semibold leading-[1.05] tracking-tight lg:text-[64px]">
					{t(gift.name ? "titleNamed" : "title", { name: gift.name })}
					<br />{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("titleSecond")}
					</em>
				</h1>
				<p className="mt-4 max-w-xl text-lg text-muted-foreground">
					{t.rich(gift.monthly ? "textMonthly" : "textOnce", {
						amount,
						strong: (chunks) => (
							<strong className="font-semibold text-foreground">
								{chunks}
							</strong>
						),
					})}
				</p>
				<div className={`mt-8 flex items-start gap-4 ${CARD}`}>
					<span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-pink text-primary-500">
						<Mail className="size-5" aria-hidden="true" />
					</span>
					<div>
						<p className="font-semibold">
							{t("emailsTitle")}{" "}
							<span className="break-all font-normal text-muted-foreground">
								{maskEmail(gift.email)}
							</span>
						</p>
						<ul className="mt-2 grid gap-1 text-[15px] text-muted-foreground">
							<li>{t("emailPaystack")}</li>
							<li>{t("emailReceipt")}</li>
						</ul>
					</div>
				</div>
				<div className="mt-8">
					<p className="font-semibold">{t("shareTitle")}</p>
					<ul className="mt-3 flex flex-wrap gap-3">
						{SHARE_LINKS.map((link) => (
							<li key={link.key}>
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-sm font-medium outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-primary-500"
								>
									{t(`share.${link.key}`)}
								</a>
							</li>
						))}
					</ul>
					<p className="mt-3 text-xs text-muted-foreground">{t("shareNote")}</p>
				</div>
			</div>
			<Aside gift={gift} amount={amount} />
		</div>
	);
}

async function MonthlyAside({
	gift,
	amount,
}: { gift: GiftSummary; amount: string }) {
	const t = await getTranslations("donate.thanks.success");
	return (
		<aside aria-label={t("monthlyTitle")} className={CARD}>
			<div className="flex items-center justify-between gap-3">
				<p className="font-semibold">{t("monthlyTitle")}</p>
				<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-900">
					{t("active")}
				</span>
			</div>
			<p className="mt-3 text-[40px] font-semibold tabular-nums text-primary-500">
				{amount}
				<span className="ml-1 text-base font-normal text-muted-foreground">
					{t("perMonth")}
				</span>
			</p>
			<dl className="mt-4 grid gap-3 border-t border-border pt-4 text-[15px]">
				<SummaryRow label={t("paidWith")} value={gift.paidWith} />
				<SummaryRow label={t("reference")} value={gift.reference} mono />
			</dl>
			<p className="mt-4 text-[15px] text-muted-foreground">
				{t("manageText")}
			</p>
			<p className="mt-4 text-sm text-muted-foreground">
				{t("questions")}{" "}
				<a
					href="mailto:hello@4herfrika.org"
					className="font-medium text-primary-500 underline underline-offset-4"
				>
					hello@4herfrika.org
				</a>
			</p>
		</aside>
	);
}

async function OnceAside({
	gift,
	amount,
}: { gift: GiftSummary; amount: string }) {
	const t = await getTranslations("donate.thanks.success");
	return (
		<aside aria-label={t("onceTitle")} className={CARD}>
			<p className="font-semibold">{t("onceTitle")}</p>
			<p className="mt-3 text-[40px] font-semibold tabular-nums text-primary-500">
				{amount}
			</p>
			<dl className="mt-4 grid gap-3 border-t border-border pt-4 text-[15px]">
				<SummaryRow label={t("paidWith")} value={gift.paidWith} />
				<SummaryRow label={t("reference")} value={gift.reference} mono />
			</dl>
			<p className="mt-4 text-[15px] text-muted-foreground">{t("onceText")}</p>
			<Link
				href="/donate#give"
				className="mt-4 inline-flex h-12 items-center rounded-full bg-primary-500 px-6 font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				{t("onceCta")}
			</Link>
		</aside>
	);
}

function SummaryRow({
	label,
	value,
	mono,
}: { label: string; value: string | null; mono?: boolean }) {
	if (!value) return null;
	return (
		<div className="flex justify-between gap-4">
			<dt className="text-muted-foreground">{label}</dt>
			<dd
				className={`text-right font-medium ${mono ? "break-all font-mono text-sm" : ""}`}
			>
				{value}
			</dd>
		</div>
	);
}
