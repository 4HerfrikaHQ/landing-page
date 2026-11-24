import type { DbCertificate } from "@/src/db/schema/tables";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { formatCertificateCode } from "../../../_helpers";
import { PrintButton } from "./print-button";

const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print {
  body > *:not(:has([data-print-sheet])) { display: none !important; }
  .print-hide { display: none !important; }
  body, main { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  [data-print-sheet] { width: 297mm !important; height: 209mm !important; max-width: none !important; box-shadow: none !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
}
`;

type Props = {
	certificate: DbCertificate;
	code: string;
	completedLabel: string;
	verifyUrl: string;
};

export function PrintSheet({
	certificate,
	code,
	completedLabel,
	verifyUrl,
}: Props) {
	const t = useTranslations("certificates.print");
	const card = useTranslations("certificates.card");
	return (
		<main className="bg-surface-indigo/40 px-4 pb-16 pt-8">
			<style>{PRINT_CSS}</style>
			<div className="mx-auto flex max-w-[70rem] flex-col items-start gap-5 print:max-w-none">
				<h1 className="print-hide text-2xl font-semibold text-secondary-500">
					{t("title")}
				</h1>
				<p className="print-hide text-base text-muted-foreground">
					{t("hint")}
				</p>
				<div className="print-hide">
					<PrintButton />
				</div>
				<div
					data-print-sheet
					className="@container relative aspect-[297/210] w-full overflow-hidden bg-white text-secondary-500 shadow-[0_12px_32px_rgba(3,6,92,0.14)] print:shadow-none"
				>
					<div className="absolute inset-[3.5cqw] border-[0.3cqw] border-secondary-500" />
					<div className="absolute inset-[4.7cqw] border-[0.1cqw] border-primary-200/50" />
					<div className="absolute inset-[7cqw] flex flex-col items-center text-center">
						<header className="flex w-full items-start justify-between">
							<Image
								src="/assets/academy/academy-logo.png"
								alt="4HerFrika"
								width={160}
								height={45}
								className="h-[3.6cqw] w-auto"
							/>
							<Attribution
								text={certificate.attribution}
								partners={certificate.partners}
							/>
						</header>
						<p className="mt-[3.5cqw] text-[1.3cqw] font-bold uppercase tracking-[0.25em] text-primary-500">
							{card("heading")}
						</p>
						<p className="mt-[1.4cqw] text-[1.45cqw] text-muted-foreground">
							{card("certifies")}
						</p>
						<p className="mt-[0.8cqw] border-b border-secondary-500/30 px-[4cqw] pb-[1.2cqw] font-playfair text-[6.2cqw] font-black italic leading-tight">
							{certificate.learner_name}
						</p>
						<p className="mt-[1.8cqw] text-[1.45cqw] text-muted-foreground">
							{t("hasCompleted")}
						</p>
						<p className="mt-[0.6cqw] text-[2.6cqw] font-semibold">
							{certificate.course_title}
						</p>
						<ul className="mt-[3cqw] flex w-full justify-center gap-[6cqw]">
							{certificate.signatories.map((signatory) => (
								<li key={signatory.name} className="w-[24cqw] text-left">
									<p className="font-playfair text-[2.4cqw] italic text-secondary-500/50">
										{signatory.name}
									</p>
									<div className="mb-[0.8cqw] border-t border-secondary-500/40" />
									<p className="text-[1.25cqw] font-bold">{signatory.name}</p>
									<p className="text-[1.25cqw] text-muted-foreground">
										{signatory.title}
									</p>
								</li>
							))}
						</ul>
						<footer className="mt-auto flex w-full items-end justify-between text-[1.25cqw]">
							<p className="font-bold">
								{card("issuedBy", { issuer: certificate.issuer })}
							</p>
							<div className="flex flex-col gap-[0.4cqw]">
								<p>
									{t("completedOn")} <strong>{completedLabel}</strong>
								</p>
								<p>
									{t("certificateId")}{" "}
									<strong className="font-mono tracking-wider">
										{formatCertificateCode(code)}
									</strong>
								</p>
								<p className="text-muted-foreground">
									{t("verifyAt", { url: verifyUrl })}
								</p>
							</div>
							<span aria-hidden="true" className="w-[12cqw]" />
						</footer>
					</div>
				</div>
			</div>
		</main>
	);
}

function Attribution({
	text,
	partners,
}: {
	text: string | null;
	partners: DbCertificate["partners"];
}) {
	return (
		<div className="flex flex-col items-end gap-[0.6cqw]">
			<AttributionText text={text} />
			<ul className="flex items-center gap-[1.5cqw]">
				{partners.map((partner) => (
					<li key={partner.name}>
						<PartnerMark partner={partner} />
					</li>
				))}
			</ul>
		</div>
	);
}

function AttributionText({ text }: { text: string | null }) {
	if (!text) return null;
	return (
		<p className="text-[1.05cqw] font-medium uppercase tracking-[0.2em] text-muted-foreground">
			{text}
		</p>
	);
}

function PartnerMark({
	partner,
}: { partner: DbCertificate["partners"][number] }) {
	if (!partner.logoUrl) {
		return <span className="text-[1.6cqw] font-semibold">{partner.name}</span>;
	}
	return (
		<Image
			src={partner.logoUrl}
			alt={partner.name}
			width={140}
			height={40}
			className="h-[3.2cqw] w-auto object-contain"
		/>
	);
}
