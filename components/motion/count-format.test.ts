import { describe, expect, test } from "bun:test";
import { formatCount, parseCount } from "./count-format";

describe("parseCount", () => {
	test("splits grouped digits from a suffix", () => {
		expect(parseCount("4,000+")).toEqual({
			digits: "4,000",
			suffix: "+",
			target: 4000,
			grouped: true,
		});
	});

	test("keeps ungrouped digits ungrouped", () => {
		expect(parseCount("3000")).toMatchObject({ target: 3000, grouped: false });
		expect(formatCount(2999, false)).toBe("2999");
		expect(formatCount(2999, true)).toBe("2,999");
	});

	test("leaves non-numeric values alone", () => {
		expect(parseCount("Free")).toMatchObject({ digits: "Free", target: null });
	});
});
