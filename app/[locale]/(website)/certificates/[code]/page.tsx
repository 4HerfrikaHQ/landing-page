import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { findCertificateByCode } from "../_certificate";
import { parseCertificateParam, toPublicCertificate } from "../_helpers";
import { CheckView } from "./_components/check-view";

type Params = { code: string };

async function loadPublicCertificate(rawCode: string) {
	const code = parseCertificateParam(rawCode);
	if (!code) return null;
	const row = await findCertificateByCode(code);
	return row ? toPublicCertificate(row) : null;
}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("certificates.check");
	return {
		title: t("metaTitle"),
		robots: { index: false, follow: false },
	};
}

export default async function CertificateCheckPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { code } = await params;
	const certificate = await loadPublicCertificate(code);
	if (!certificate) notFound();
	const locale = await getLocale();
	return <CheckView certificate={certificate} locale={locale} />;
}
