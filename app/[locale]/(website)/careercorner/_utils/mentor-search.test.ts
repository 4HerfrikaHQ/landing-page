import { expect, test } from "bun:test";
import { toPrefixTsQuery } from "./mentor-search";

test("turns each word into a prefix term", () => {
	expect(toPrefixTsQuery("Product Management")).toBe(
		"product:* & management:*",
	);
});

test("drops tsquery operators and punctuation", () => {
	expect(toPrefixTsQuery("c++ & (ui|ux) !design:*")).toBe(
		"c:* & ui:* & ux:* & design:*",
	);
	expect(toPrefixTsQuery("  ' & | ! ")).toBe("");
});
