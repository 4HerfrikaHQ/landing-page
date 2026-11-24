import { Award } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Course } from "../../_helpers";

export function Outcomes({ outcomes }: { outcomes: string[] }) {
	const t = useTranslations("academy.course");
	if (outcomes.length === 0) return null;
	return (
		<section aria-labelledby="outcomes-title" className="flex flex-col gap-3">
			<h2
				id="outcomes-title"
				className="text-xl font-semibold text-secondary-500"
			>
				{t("outcomesTitle")}
			</h2>
			<ul className="flex flex-col gap-2.5">
				{outcomes.map((outcome) => (
					<li key={outcome} className="flex gap-3 text-base text-foreground">
						<span aria-hidden="true" className="font-bold text-primary-500">
							✓
						</span>
						{outcome}
					</li>
				))}
			</ul>
		</section>
	);
}

export function CertificateInfo({
	certificate,
}: {
	certificate: Course["certificate"];
}) {
	const t = useTranslations("academy.course");
	return (
		<section
			aria-labelledby="certificate-title"
			className="flex gap-4 rounded-3xl bg-amber-50 p-5"
		>
			<Award
				className="mt-1 size-6 shrink-0 text-secondary-500"
				aria-hidden="true"
			/>
			<div className="flex flex-col gap-2">
				<h2
					id="certificate-title"
					className="text-base font-semibold text-secondary-500"
				>
					{t("certificateTitle")}
				</h2>
				<p className="text-sm leading-6 text-foreground">
					{t("certificateBody", { issuer: certificate.issuer })}
				</p>
				<Attribution text={certificate.attribution} />
				<Signatories signatories={certificate.signatories} />
			</div>
		</section>
	);
}

function Attribution({ text }: { text: string | null }) {
	if (!text) return null;
	return <p className="text-sm text-muted-foreground">{text}</p>;
}

function Signatories({
	signatories,
}: {
	signatories: Course["certificate"]["signatories"];
}) {
	const t = useTranslations("academy.course");
	if (signatories.length === 0) return null;
	return (
		<div className="flex flex-col gap-1">
			<p className="text-xs font-bold uppercase tracking-wide text-primary-700">
				{t("signedBy")}
			</p>
			<ul className="flex flex-col gap-0.5 text-sm text-foreground">
				{signatories.map((person) => (
					<li key={person.name}>
						<span className="font-semibold">{person.name}</span>
						{person.title ? `, ${person.title}` : ""}
					</li>
				))}
			</ul>
		</div>
	);
}

export function LicenceNotice({ notice }: { notice: string[] }) {
	const t = useTranslations("academy.course");
	if (notice.length === 0) return null;
	return (
		<section aria-label={t("noticeTitle")} className="flex flex-col gap-1">
			{notice.map((paragraph) => (
				<p key={paragraph} className="text-xs leading-5 text-muted-foreground">
					{paragraph}
				</p>
			))}
		</section>
	);
}
