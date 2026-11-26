import { type Currency, formatAmount } from "./amounts";

export type ReceiptTranslator = (
	key: string,
	values?: Record<string, string | number>,
) => string;

export type ReceiptInput = {
	t: ReceiptTranslator;
	siteUrl: string;
	locale: string;
	donorName: string;
	amount: number;
	currency: Currency;
	monthly: boolean;
	reference: string;
	paidAt: string;
	paidWith: string | null;
	manageLink: string | null;
};

const ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

function row(label: string, value: string): string {
	return `<tr><th align="left" style="padding:10px 0;border-top:1px solid #ececf3;font-size:13px;font-weight:600;color:#5b5d78;width:42%">${escapeHtml(label)}</th><td style="padding:10px 0;border-top:1px solid #ececf3;font-size:15px;color:#111827">${escapeHtml(value)}</td></tr>`;
}

function manageBlock(input: ReceiptInput): string {
	if (!input.monthly) return "";
	const { t, manageLink } = input;
	if (!manageLink) {
		return `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#111827">${escapeHtml(t("manageFallback"))}</p>`;
	}
	return `<p style="margin:28px 0 0"><a href="${escapeHtml(manageLink)}" style="display:inline-block;background:#c8007a;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:999px">${escapeHtml(t("manageCta"))}</a></p><p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#5b5d78">${escapeHtml(t("manageNote"))}</p>`;
}

export function buildReceiptEmail(input: ReceiptInput) {
	const { t, donorName, amount, currency, monthly, locale } = input;
	const formatted = formatAmount(amount, currency, locale);
	const greeting = donorName
		? t("greetingNamed", { name: donorName })
		: t("greeting");
	const heading = monthly ? t("headingMonthly") : t("headingOnce");
	const subject = monthly ? t("subjectMonthly") : t("subjectOnce");
	const frequency = monthly ? t("frequencyMonthly") : t("frequencyOnce");

	const rows = [
		row(t("rowDate"), input.paidAt),
		row(t("rowDonor"), donorName || t("rowDonorAnonymous")),
		row(t("rowGift"), `${formatted} · ${frequency}`),
		input.paidWith ? row(t("rowPaidWith"), input.paidWith) : "",
		row(t("rowReference"), input.reference),
	].join("");

	const html = `<!doctype html><html lang="en"><body style="margin:0;background:#fff4fc;font-family:Helvetica,Arial,sans-serif;color:#111827">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<div style="background:#ffffff;border-radius:20px;overflow:hidden">
<div style="background:#03065c;padding:20px 32px"><span style="font-size:18px;font-weight:700;color:#ffffff">4HerFrika</span> <span style="font-size:13px;color:#ff5cc0;margin-left:8px">${escapeHtml(t("badge"))}</span></div>
<div style="padding:32px">
<p style="margin:0;font-size:16px;color:#5b5d78">${escapeHtml(greeting)}</p>
<h1 style="margin:8px 0 0;font-size:28px;line-height:1.2;color:#03065c">${escapeHtml(heading)}</h1>
<p style="margin:12px 0 0;font-size:40px;font-weight:700;color:#c8007a">${escapeHtml(formatted)}${monthly ? `<span style="font-size:16px;font-weight:500;color:#5b5d78"> ${escapeHtml(t("perMonth"))}</span>` : ""}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse"><caption style="text-align:left;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5b5d78;padding-bottom:8px">${escapeHtml(t("details"))}</caption><tbody>${rows}</tbody></table>
${manageBlock(input)}
<p style="margin:28px 0 0;font-size:15px;line-height:1.6;color:#111827">${escapeHtml(t("year1"))} <a href="${escapeHtml(input.siteUrl)}/impact" style="color:#c8007a">${escapeHtml(t("year1Link"))}</a></p>
</div>
<div style="background:#f7f7fb;padding:20px 32px;font-size:13px;line-height:1.6;color:#5b5d78">
<p style="margin:0">${escapeHtml(t("footerKeep"))}</p>
<p style="margin:8px 0 0">${escapeHtml(t("footerQuestions"))} <a href="mailto:hello@4herfrika.org" style="color:#c8007a">hello@4herfrika.org</a></p>
</div></div></div></body></html>`;

	const text = [
		greeting,
		heading,
		`${formatted} · ${frequency}`,
		`${t("rowDate")}: ${input.paidAt}`,
		`${t("rowReference")}: ${input.reference}`,
		input.monthly && input.manageLink
			? `${t("manageCta")}: ${input.manageLink}`
			: "",
		t("footerKeep"),
	]
		.filter(Boolean)
		.join("\n");

	return { subject, html, text };
}
