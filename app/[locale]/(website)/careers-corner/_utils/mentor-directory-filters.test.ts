import { describe, expect, test } from "bun:test";
import { filterMentors } from "./mentor-directory-filters";

const mentors = [
	{
		id: "ademide",
		nickname: null,
		name: "Ademide",
		position: "Founder 4herfrika",
		availability: [],
	},
	{
		id: "adesewa",
		nickname: null,
		name: "Adesewa",
		position: "Product Designer",
		availability: [{ id: "slot" }],
	},
];

describe("filterMentors", () => {
	test("returns every mentor when the search query is cleared", () => {
		expect(filterMentors(mentors, "   ", false)).toEqual(mentors);
	});

	test("still applies the availability filter when search is cleared", () => {
		expect(filterMentors(mentors, "", true)).toEqual([mentors[1]]);
	});
});
