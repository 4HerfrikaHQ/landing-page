import { describe, expect, test } from "bun:test";
import { buildReceiptEmail, escapeHtml } from "./receipt-email";

const t = (key: string, values?: Record<string, string | number>) =>
	values ? `${key}:${Object.values(values).join(",")}` : key;

const base = {
	t,
	siteUrl: "https://4herfrika.org",
	locale: "en",
	donorName: "Amara <b>",
	amount: 25000,
	currency: "NGN" as const,
	monthly: false,
	reference: "4HF-REF",
	paidAt: "21 November 2026",
	paidWith: "visa •••• 4081",
	manageLink: null,
};

describe("buildReceiptEmail", () => {
	test("escapes donor-supplied text", () => {
		const { html } = buildReceiptEmail(base);
		expect(html).not.toContain("<b>");
		expect(html).toContain("&lt;b&gt;");
	});

	test("uses the one-time subject and shows no manage link", () => {
		const { subject, html } = buildReceiptEmail(base);
		expect(subject).toBe("subjectOnce");
		expect(html).not.toContain("manageCta");
	});

	test("links monthly donors to the Paystack manage page", () => {
		const { subject, html, text } = buildReceiptEmail({
			...base,
			monthly: true,
			manageLink: "https://paystack.com/manage/abc",
		});
		expect(subject).toBe("subjectMonthly");
		expect(html).toContain('href="https://paystack.com/manage/abc"');
		expect(text).toContain("https://paystack.com/manage/abc");
	});

	test("falls back to a note when the manage link is unavailable", () => {
		const { html } = buildReceiptEmail({ ...base, monthly: true });
		expect(html).toContain("manageFallback");
	});
});

describe("escapeHtml", () => {
	test("escapes quotes and angle brackets", () => {
		expect(escapeHtml(`<a href="x">&'`)).toBe(
			"&lt;a href=&quot;x&quot;&gt;&amp;&#39;",
		);
	});
});
