import { describe, expect, test } from "bun:test";
import { parseLegalSource } from "./legal-source";

describe("parseLegalSource", () => {
	test("reads the title, date and numbered headings", () => {
		const result = parseLegalSource(
			"# Terms and Conditions\n\n_Last updated: 6 July 2026_\n\nIntro.\n\n## Who we are\n\nText.\n\n## Contact\n\nMail.\n",
		);

		expect(result.title).toBe("Terms and Conditions");
		expect(result.updated).toBe("Last updated: 6 July 2026");
		expect(result.headings).toEqual([
			{ id: "section-1", text: "Who we are" },
			{ id: "section-2", text: "Contact" },
		]);
	});

	test("returns a null date when the document has none", () => {
		expect(parseLegalSource("# Title\n\n## One\n").updated).toBeNull();
	});
});
