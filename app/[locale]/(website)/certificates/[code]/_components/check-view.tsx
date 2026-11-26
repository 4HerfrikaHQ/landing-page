import { RollLabel } from "@/components/ui/roll-label";
import { Check, TriangleAlert } from "lucide-react";
import type { Route } from "next";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { localizedPath } from "../../../academy/sign-in/_helpers";
import {
	CertificateCard,
	CertificateFooter,
} from "../../_components/certificate-card";
import { type PublicCertificate, formatCertificateDate } from "../../_helpers";

const CONTACT_EMAIL = "hello@4herfrika.org";

type Valid = Extract<PublicCertificate, { status: "valid" }>;
type Withdrawn = Extract<PublicCertificate, { status: "withdrawn" }>;

export function CheckView({
	certificate,
	locale,
}: {
	certificate: PublicCertificate;
	locale: Locale;
}) {
	return (
		<main className="bg-surface-indigo/40 px-5 pb-16 pt-8 lg:px-8 lg:pt-14">
			<div className="mx-auto max-w-5xl">
				<ValidView certificate={certificate} locale={locale} />
				<WithdrawnView certificate={certificate} locale={locale} />
			</div>
		</main>
	);
}

function ValidView({
	certificate,
	locale,
}: {
	certificate: PublicCertificate;
	locale: Locale;
}) {
	if (certificate.status !== "valid") return null;
	return <ValidCertificate certificate={certificate} locale={locale} />;
}

function WithdrawnView({
	certificate,
	locale,
}: {
	certificate: PublicCertificate;
	locale: Locale;
}) {
	if (certificate.status !== "withdrawn") return null;
	return <WithdrawnCertificate certificate={certificate} locale={locale} />;
}

function AboutLink({ locale }: { locale: Locale }) {
	const t = useTranslations("certificates.check");
	return (
		<Link
			href={localizedPath(locale, "/academy") as Route}
			className="press inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-primary-700 px-6 py-3 text-base font-semibold text-primary-700 outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-secondary-500"
		>
			<RollLabel>{t("about")}</RollLabel>
		</Link>
	);
}

function ValidCertificate({
	certificate,
	locale,
}: {
	certificate: Valid;
	locale: Locale;
}) {
	const t = useTranslations("certificates.check");
	return (
		<div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:grid-rows-[auto_auto_auto_1fr] lg:items-start lg:gap-x-10">
			<section
				aria-labelledby="status-title"
				className="flex items-center gap-4 rounded-3xl bg-[#1a6b42] p-5 text-white lg:col-start-2 lg:row-start-1"
			>
				<span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
					<Check className="size-6" aria-hidden="true" />
				</span>
				<div>
					<h1 id="status-title" className="text-xl font-semibold">
						{t("validTitle")}
					</h1>
					<p className="text-sm">
						{t("issuedBy", { issuer: certificate.issuer })}
					</p>
				</div>
			</section>
			<CertificateCard
				name={certificate.name}
				courseTitle={certificate.courseTitle}
				partners={certificate.partners}
				className="lg:col-start-1 lg:row-span-4 lg:row-start-1"
			>
				<CertificateFooter
					issuer={certificate.issuer}
					attribution={certificate.attribution}
				>
					<dl className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="text-muted-foreground">{t("completedOn")}</dt>
							<dd className="font-semibold text-secondary-500">
								{formatCertificateDate(certificate.completedAt, locale)}
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground">{t("status")}</dt>
							<dd className="font-semibold text-[#1a6b42]">{t("valid")}</dd>
						</div>
					</dl>
				</CertificateFooter>
			</CertificateCard>
			<p className="text-sm text-muted-foreground lg:col-start-2">
				{t("proof")}
			</p>
			<div className="lg:col-start-2">
				<AboutLink locale={locale} />
			</div>
		</div>
	);
}

function WithdrawnCertificate({
	certificate,
	locale,
}: {
	certificate: Withdrawn;
	locale: Locale;
}) {
	const t = useTranslations("certificates.check");
	const date = formatCertificateDate(certificate.withdrawnAt, locale);
	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-5 lg:pt-10">
			<section
				aria-labelledby="status-title"
				className="flex items-center gap-4 rounded-3xl bg-[#b3261e] p-5 text-white"
			>
				<span
					aria-hidden="true"
					className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20"
				>
					<TriangleAlert className="size-6" />
				</span>
				<div>
					<h1 id="status-title" className="text-xl font-semibold">
						{t("withdrawnTitle")}
					</h1>
					<p className="text-sm">{t("withdrawnBody", { date })}</p>
				</div>
			</section>
			<dl className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_12px_32px_rgba(3,6,92,0.08)] sm:grid-cols-3">
				<div>
					<dt className="text-sm text-muted-foreground">{t("course")}</dt>
					<dd className="font-semibold text-secondary-500">
						{certificate.courseTitle}
					</dd>
				</div>
				<div>
					<dt className="text-sm text-muted-foreground">{t("withdrawnOn")}</dt>
					<dd className="font-semibold text-secondary-500">{date}</dd>
				</div>
				<div>
					<dt className="text-sm text-muted-foreground">{t("status")}</dt>
					<dd className="font-semibold text-[#b3261e]">{t("withdrawn")}</dd>
				</div>
			</dl>
			<p className="text-sm text-muted-foreground">
				{t.rich("withdrawnNote", {
					email: (chunks) => (
						<a
							href={`mailto:${CONTACT_EMAIL}`}
							className="text-primary-700 underline underline-offset-2"
						>
							{chunks}
						</a>
					),
				})}
			</p>
		</div>
	);
}
