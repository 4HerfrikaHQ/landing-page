import { expect, test } from "bun:test";
import {
	MENTOR_MAX_PAGE,
	parseMentorPage,
	toPrefixTsQuery,
} from "./mentor-search";

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

test("falls back to the first page for anything that isn't a positive whole number", () => {
	for (const value of [
		undefined,
		"",
		"abc",
		"0",
		"-3",
		"2.5",
		"Infinity",
		"1e400",
	]) {
		expect(parseMentorPage(value)).toBe(1);
	}
	expect(parseMentorPage("4")).toBe(4);
});

test("caps very large pages so the offset stays a valid integer", () => {
	expect(parseMentorPage("1e300")).toBe(1);
	expect(parseMentorPage(String(Number.MAX_SAFE_INTEGER))).toBe(
		MENTOR_MAX_PAGE,
	);
});
