import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { findCertificateByCode } from "../../_certificate";
import {
	certificatePath,
	certificateUrl,
	formatCertificateDate,
	normaliseCertificateCode,
	siteUrl,
} from "../../_helpers";
import { PrintSheet } from "./_components/print-sheet";

type Params = { code: string };

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("certificates.print");
	return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function PrintCertificatePage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { code: rawCode } = await params;
	const code = normaliseCertificateCode(decodeURIComponent(rawCode));
	if (!code) notFound();
	const certificate = await findCertificateByCode(code);
	if (!certificate) notFound();
	const locale = await getLocale();
	if (certificate.revoked_at) redirect(certificatePath(locale, code));
	const url = certificateUrl(siteUrl(), locale, code);

	return (
		<PrintSheet
			certificate={certificate}
			code={code}
			completedLabel={formatCertificateDate(certificate.completed_at, locale)}
			verifyUrl={url.replace(/^https?:\/\//, "")}
		/>
	);
}
