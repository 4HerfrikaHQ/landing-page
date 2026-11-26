import type {
	CertificatePartner,
	CertificateSignatory,
} from "@/src/db/schema/tables/certificates";
import type { Route } from "next";
import type { Locale } from "next-intl";
import { localizedPath } from "../academy/sign-in/_helpers";

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;
export const CODE_GROUP_SIZE = 4;
export const CERTIFICATES_PATH = "/certificates";
export const DEFAULT_SITE_URL = "https://4herfrika.org";
export const DEFAULT_SIGNATORIES: CertificateSignatory[] = [
	{ name: "Ademide", title: "Founder, 4HerFrika" },
	{ name: "Hack Angel", title: "" },
];

const ALPHABET_MASK = CODE_ALPHABET.length - 1;
const CODE_SEPARATORS = /[\s-]/g;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateCertificateCode(
	randomBytes: (length: number) => Uint8Array,
): string {
	return Array.from(
		randomBytes(CODE_LENGTH),
		(byte) => CODE_ALPHABET[byte & ALPHABET_MASK],
	).join("");
}

export function formatCertificateCode(code: string): string {
	return `${code.slice(0, CODE_GROUP_SIZE)}-${code.slice(CODE_GROUP_SIZE)}`;
}

export function normaliseCertificateCode(input: string): string | null {
	const code = input.replace(CODE_SEPARATORS, "").toUpperCase();
	return CODE_PATTERN.test(code) ? code : null;
}

export function parseCertificateParam(raw: string): string | null {
	try {
		return normaliseCertificateCode(decodeURIComponent(raw));
	} catch {
		return null;
	}
}

type SnapshotCourse = {
	title: string;
	partners: { name: string; logoUrl: string | null }[];
	certificate: {
		issuer: string;
		attribution: string | null;
		signatories: CertificateSignatory[];
	};
};

export function buildCertificateSnapshot(input: {
	learnerName: string;
	course: SnapshotCourse;
	completedAt: Date;
}) {
	const { course } = input;
	const signatories =
		course.certificate.signatories.length > 0
			? course.certificate.signatories
			: DEFAULT_SIGNATORIES;
	const partners: CertificatePartner[] = course.partners.map(
		({ name, logoUrl }) => ({ name, logoUrl }),
	);
	return {
		learner_name: input.learnerName.trim(),
		course_title: course.title,
		issuer: course.certificate.issuer,
		attribution: course.certificate.attribution,
		partners,
		signatories: signatories.map(({ name, title }) => ({ name, title })),
		completed_at: input.completedAt,
	};
}

export function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

export function certificatePath(locale: Locale, code: string): Route {
	return localizedPath(
		locale,
		`${CERTIFICATES_PATH}/${formatCertificateCode(code)}`,
	);
}

export function certificateUrl(
	origin: string,
	locale: Locale,
	code: string,
): string {
	return `${origin}${certificatePath(locale, code)}`;
}

export function linkedInAddUrl(input: {
	courseTitle: string;
	issuer: string;
	code: string;
	completedAt: Date;
	url: string;
}): string {
	const params = new URLSearchParams({
		startTask: "CERTIFICATION_NAME",
		name: input.courseTitle,
		organizationName: input.issuer,
		issueYear: String(input.completedAt.getUTCFullYear()),
		issueMonth: String(input.completedAt.getUTCMonth() + 1),
		certUrl: input.url,
		certId: formatCertificateCode(input.code),
	});
	return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function whatsappShareUrl(message: string, url: string): string {
	return `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
}

export function formatCertificateDate(date: Date, locale: Locale): string {
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

type PublicCertificateRow = {
	learner_name: string;
	course_title: string;
	issuer: string;
	attribution: string | null;
	partners: CertificatePartner[];
	signatories: CertificateSignatory[];
	completed_at: Date;
	revoked_at: Date | null;
};

export type PublicCertificate =
	| {
			status: "valid";
			name: string;
			courseTitle: string;
			issuer: string;
			attribution: string | null;
			partners: CertificatePartner[];
			signatories: CertificateSignatory[];
			completedAt: Date;
	  }
	| { status: "withdrawn"; courseTitle: string; withdrawnAt: Date };

export function toPublicCertificate(
	row: PublicCertificateRow,
): PublicCertificate {
	if (row.revoked_at) {
		return {
			status: "withdrawn",
			courseTitle: row.course_title,
			withdrawnAt: row.revoked_at,
		};
	}
	return {
		status: "valid",
		name: row.learner_name,
		courseTitle: row.course_title,
		issuer: row.issuer,
		attribution: row.attribution,
		partners: row.partners,
		signatories: row.signatories,
		completedAt: row.completed_at,
	};
}
