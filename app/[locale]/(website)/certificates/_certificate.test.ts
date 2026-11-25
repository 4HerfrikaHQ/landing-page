import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));
mock.module("@/src/db", () => ({ db: {} }));

const { issueCertificate } = await import("./_certificate");

const snapshot = {
	learner_name: "Ada",
	course_title: "Course",
	issuer: "4HerFrika",
	attribution: null,
	partners: [],
	signatories: [],
	completed_at: new Date(),
};

function fakeTx(inserts: (unknown | undefined)[], existing: unknown[]) {
	let insertCalls = 0;
	const tx = {
		insert: () => ({
			values: () => ({
				onConflictDoNothing: () => ({
					returning: async () => {
						const result = inserts[insertCalls++];
						return result ? [result] : [];
					},
				}),
			}),
		}),
		select: () => ({
			from: () => ({ where: () => ({ limit: async () => existing }) }),
		}),
	};
	return { tx: tx as never, calls: () => insertCalls };
}

describe("issueCertificate", () => {
	test("returns the issued certificate", async () => {
		const { tx } = fakeTx([{ code: "AAAAAAAA" }], []);
		expect(await issueCertificate(tx, "e1", snapshot)).toEqual({
			code: "AAAAAAAA",
		});
	});

	test("returns null when the enrolment already has a certificate", async () => {
		const { tx } = fakeTx([undefined], [{ id: "c1" }]);
		expect(await issueCertificate(tx, "e1", snapshot)).toBeNull();
	});

	test("retries a code collision with a fresh code", async () => {
		const { tx, calls } = fakeTx([undefined, { code: "BBBBBBBB" }], []);
		expect(await issueCertificate(tx, "e1", snapshot)).toEqual({
			code: "BBBBBBBB",
		});
		expect(calls()).toBe(2);
	});

	test("gives up after repeated collisions", async () => {
		const { tx } = fakeTx([], []);
		await expect(issueCertificate(tx, "e1", snapshot)).rejects.toThrow();
	});
});
