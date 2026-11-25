import "server-only";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";
import { certificateUrl, formatCertificateCode, siteUrl } from "./_helpers";

const FROM = "4herfrika <hello@4herfrika.org>";

type CertificateEmail = {
	to: string;
	name: string;
	courseTitle: string;
	code: string;
	locale: Locale;
};

export async function sendCertificateReadyEmail(input: CertificateEmail) {
	const resendApiKey = process.env.RESEND_API_KEY;
	if (!resendApiKey) {
		console.warn(
			"[certificate-ready] RESEND_API_KEY not configured, skipping email",
		);
		return;
	}
	const t = await getTranslations({
		locale: input.locale,
		namespace: "certificates.email",
	});
	const firstName = input.name.split(/\s+/)[0];
	const link = certificateUrl(siteUrl(), input.locale, input.code);
	const resend = new Resend(resendApiKey);
	await resend.emails.send(
		{
			from: FROM,
			to: input.to,
			subject: t("subject"),
			text: `${t("greeting", { name: firstName })}\n\n${t("body", { course: input.courseTitle })}\n\n${link}\n\n${t("share")}\n\n${t("certificateId", { code: formatCertificateCode(input.code) })}\n\n${t("signoff")}\n\n${t("footer")}`,
		},
		{ idempotencyKey: `certificate-ready/${input.code}` },
	);
}
