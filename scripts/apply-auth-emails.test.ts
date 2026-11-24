import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import config from "../supabase/config.toml";

const ROOT = join(import.meta.dir, "..");

describe("sign-in emails", () => {
	const { confirmation, magic_link } = config.auth.email.template;

	test("both emails a learner can receive carry the 6-digit code", async () => {
		for (const template of [confirmation, magic_link]) {
			const html = await Bun.file(join(ROOT, template.content_path)).text();
			expect(html).toContain("{{ .Token }}");
			expect(html).not.toContain("{{ .ConfirmationURL }}");
			expect(template.subject).toContain("{{ .Token }}");
		}
	});

	test("the code lasts as long as the sign-in screen says", async () => {
		const html = await Bun.file(join(ROOT, confirmation.content_path)).text();
		expect(config.auth.email.otp_expiry).toBe(600);
		expect(html).toContain("10 minutes");
	});
});
