import { SiteImage as Image } from "@/components/ui/site-image";
import academyLogoImage from "@/public/assets/academy/academy-logo.png";
import type { CertificatePartner } from "@/src/db/schema/tables/certificates";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type CardProps = {
	name: string;
	courseTitle: string;
	partners: CertificatePartner[];
	className?: string;
	children: ReactNode;
};

export function CertificateCard({
	name,
	courseTitle,
	partners,
	className,
	children,
}: CardProps) {
	const t = useTranslations("certificates.card");
	return (
		<article
			aria-label={t("label")}
			className={`flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_48px_rgba(3,6,92,0.14)] lg:p-12 ${className ?? ""}`}
		>
			<header className="flex items-center justify-between gap-4">
				<Image
					src={academyLogoImage}
					alt="4HerFrika"
					width={128}
					height={36}
					className="h-7 w-auto object-contain lg:h-9"
				/>
				<PartnerLogos partners={partners} />
			</header>
			<p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
				{t("heading")}
			</p>
			<p className="text-sm text-muted-foreground lg:text-lg">
				{t("certifies")}
			</p>
			<p className="font-playfair text-3xl font-black italic leading-tight text-secondary-500 [overflow-wrap:anywhere] lg:text-6xl">
				{name}
			</p>
			<p className="text-base text-secondary-500 lg:text-xl">
				{t("completed")}{" "}
				<strong className="font-semibold">{courseTitle}</strong>
			</p>
			{children}
		</article>
	);
}

function PartnerLogos({ partners }: { partners: CertificatePartner[] }) {
	return (
		<ul className="flex items-center gap-3">
			{partners.map((partner) => (
				<li key={partner.name}>
					<PartnerMark partner={partner} />
				</li>
			))}
		</ul>
	);
}

function PartnerMark({ partner }: { partner: CertificatePartner }) {
	if (!partner.logoUrl) {
		return (
			<span className="text-sm font-semibold text-secondary-500">
				{partner.name}
			</span>
		);
	}
	return (
		<Image
			src={partner.logoUrl}
			alt={partner.name}
			width={96}
			height={28}
			className="h-6 w-auto object-contain lg:h-8"
		/>
	);
}

export function CertificateFooter({
	issuer,
	attribution,
	children,
}: {
	issuer: string;
	attribution: string | null;
	children?: ReactNode;
}) {
	const t = useTranslations("certificates.card");
	return (
		<footer className="mt-2 flex flex-col gap-3 border-t border-border pt-5">
			{children}
			<p className="text-sm text-muted-foreground">
				{t("issuedBy", { issuer })}
				<Attribution text={attribution} />
			</p>
		</footer>
	);
}

function Attribution({ text }: { text: string | null }) {
	if (!text) return null;
	return <> · {text}</>;
}
