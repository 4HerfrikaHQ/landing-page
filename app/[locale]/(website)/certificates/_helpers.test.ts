import { describe, expect, test } from "bun:test";
import {
	CODE_ALPHABET,
	CODE_LENGTH,
	buildCertificateSnapshot,
	certificateUrl,
	formatCertificateCode,
	generateCertificateCode,
	linkedInAddUrl,
	normaliseCertificateCode,
	parseCertificateParam,
	toPublicCertificate,
	whatsappShareUrl,
} from "./_helpers";

const course = {
	title: "AI for Your Next Opportunity",
	partners: [{ name: "Ordina", logoUrl: "https://img.example/ordina.png" }],
	certificate: {
		issuer: "4HerFrika",
		attribution: "Course content by Ordina",
		signatories: [{ name: "Ademide", title: "Founder, 4HerFrika" }],
	},
};

describe("generateCertificateCode", () => {
	test("uses only unambiguous characters", () => {
		for (const ambiguous of ["0", "O", "1", "I"]) {
			expect(CODE_ALPHABET).not.toContain(ambiguous);
		}
		expect(CODE_ALPHABET).toHaveLength(32);
	});

	test("maps each byte onto the alphabet by its low five bits", () => {
		const bytes = Uint8Array.from([0, 1, 31, 32, 33, 255, 128, 64]);
		const code = generateCertificateCode(() => bytes);
		expect(code).toBe("AB9AB9AA");
	});

	test("requests exactly CODE_LENGTH bytes", () => {
		let requested = 0;
		generateCertificateCode((length) => {
			requested = length;
			return new Uint8Array(length);
		});
		expect(requested).toBe(CODE_LENGTH);
	});

	test("real random bytes give distinct valid codes", () => {
		const codes = new Set(
			Array.from({ length: 500 }, () =>
				generateCertificateCode((length) =>
					crypto.getRandomValues(new Uint8Array(length)),
				),
			),
		);
		expect(codes.size).toBe(500);
		for (const code of codes) expect(normaliseCertificateCode(code)).toBe(code);
	});
});

describe("code formatting", () => {
	test("groups in fours", () => {
		expect(formatCertificateCode("K7P2QX9M")).toBe("K7P2-QX9M");
	});

	test("normalises case, dashes and spaces", () => {
		expect(normaliseCertificateCode("k7p2-qx9m")).toBe("K7P2QX9M");
		expect(normaliseCertificateCode(" K7P2 QX9M ")).toBe("K7P2QX9M");
	});

	test("rejects wrong length and ambiguous characters", () => {
		expect(normaliseCertificateCode("K7P2QX9")).toBeNull();
		expect(normaliseCertificateCode("K7P2QX9MM")).toBeNull();
		expect(normaliseCertificateCode("K7P2QX90")).toBeNull();
		expect(normaliseCertificateCode("K7P2QXOM")).toBeNull();
		expect(normaliseCertificateCode("")).toBeNull();
	});
});

describe("buildCertificateSnapshot", () => {
	const completedAt = new Date("2026-12-11T10:00:00Z");

	test("snapshots the course and learner", () => {
		expect(
			buildCertificateSnapshot({
				learnerName: "  Amara Okafor ",
				course,
				completedAt,
			}),
		).toEqual({
			learner_name: "Amara Okafor",
			course_title: "AI for Your Next Opportunity",
			issuer: "4HerFrika",
			attribution: "Course content by Ordina",
			partners: [{ name: "Ordina", logoUrl: "https://img.example/ordina.png" }],
			signatories: [{ name: "Ademide", title: "Founder, 4HerFrika" }],
			completed_at: completedAt,
		});
	});

	test("falls back to the default signatories", () => {
		const snapshot = buildCertificateSnapshot({
			learnerName: "Amara",
			course: {
				...course,
				certificate: { ...course.certificate, signatories: [] },
			},
			completedAt,
		});
		expect(snapshot.signatories.map(({ name }) => name)).toEqual([
			"Ademide",
			"Hack Angel",
		]);
	});

	test("does not alias course arrays", () => {
		const snapshot = buildCertificateSnapshot({
			learnerName: "Amara",
			course,
			completedAt,
		});
		expect(snapshot.partners).not.toBe(course.partners);
		expect(snapshot.signatories).not.toBe(course.certificate.signatories);
	});
});

describe("status and links", () => {
	test("certificate url keeps the locale prefix", () => {
		expect(certificateUrl("https://4herfrika.org", "en", "K7P2QX9M")).toBe(
			"https://4herfrika.org/certificates/K7P2-QX9M",
		);
		expect(certificateUrl("https://4herfrika.org", "fr", "K7P2QX9M")).toBe(
			"https://4herfrika.org/fr/certificates/K7P2-QX9M",
		);
	});

	test("LinkedIn add-to-profile url carries the certificate url", () => {
		const url = new URL(
			linkedInAddUrl({
				courseTitle: "AI for Your Next Opportunity",
				issuer: "4HerFrika",
				code: "K7P2QX9M",
				completedAt: new Date("2026-12-11T10:00:00Z"),
				url: "https://4herfrika.org/certificates/K7P2-QX9M",
			}),
		);
		expect(url.origin + url.pathname).toBe(
			"https://www.linkedin.com/profile/add",
		);
		expect(url.searchParams.get("certUrl")).toBe(
			"https://4herfrika.org/certificates/K7P2-QX9M",
		);
		expect(url.searchParams.get("issueMonth")).toBe("12");
		expect(url.searchParams.get("issueYear")).toBe("2026");
		expect(url.searchParams.get("certId")).toBe("K7P2-QX9M");
	});

	test("WhatsApp url encodes the message", () => {
		const url = whatsappShareUrl("I did it & more", "https://x.test/a?b=1");
		expect(url.startsWith("https://wa.me/?text=")).toBe(true);
		expect(decodeURIComponent(url.split("text=")[1])).toBe(
			"I did it & more https://x.test/a?b=1",
		);
	});
});

describe("toPublicCertificate", () => {
	const row = {
		learner_name: "Amara Okafor",
		course_title: "AI for Your Next Opportunity",
		issuer: "4HerFrika",
		attribution: null,
		partners: [],
		signatories: [],
		completed_at: new Date("2026-12-11T10:00:00Z"),
		revoked_at: null,
	};

	test("valid shows name, course and date", () => {
		const view = toPublicCertificate(row);
		expect(view.status).toBe("valid");
		expect(view).toMatchObject({
			name: "Amara Okafor",
			courseTitle: "AI for Your Next Opportunity",
		});
	});

	test("a revoked certificate reads as withdrawn and drops personal data", () => {
		const view = toPublicCertificate({
			...row,
			revoked_at: new Date("2027-01-14T00:00:00Z"),
		});
		expect(view).toEqual({
			status: "withdrawn",
			courseTitle: "AI for Your Next Opportunity",
			withdrawnAt: new Date("2027-01-14T00:00:00Z"),
		});
		expect(JSON.stringify(view)).not.toContain("Amara");
	});
});

describe("parseCertificateParam", () => {
	test("decodes an encoded, grouped code", () => {
		expect(parseCertificateParam("abcd%2Defgh")).toBe("ABCDEFGH");
	});

	test("returns null for malformed percent-encoding instead of throwing", () => {
		expect(parseCertificateParam("%E0%A4%A")).toBeNull();
	});
});
