import { describe, expect, test } from "bun:test";
import {
	type CarouselEvent,
	carouselReducer,
	initialCarouselState,
} from "./carousel-machine";

const run = (...events: CarouselEvent[]) =>
	events.reduce(carouselReducer, initialCarouselState(3));

describe("carouselReducer", () => {
	test("slides onto the trailing clone and lands on the first card", () => {
		const sliding = run(
			{ type: "MOVE", direction: "next", instant: false },
			{ type: "SLIDE_END" },
			{ type: "MOVE", direction: "next", instant: false },
			{ type: "SLIDE_END" },
			{ type: "MOVE", direction: "next", instant: false },
		);
		expect(sliding).toMatchObject({ status: "sliding", slide: 4 });

		const settled = carouselReducer(sliding, { type: "SLIDE_END" });
		expect(settled).toMatchObject({ status: "idle", slide: 1 });
	});

	test("slides back onto the leading clone and lands on the last card", () => {
		const sliding = run({ type: "MOVE", direction: "prev", instant: false });
		expect(sliding.slide).toBe(0);
		expect(carouselReducer(sliding, { type: "SLIDE_END" }).slide).toBe(3);
	});

	test("ignores moves while a slide is running", () => {
		const state = run(
			{ type: "MOVE", direction: "next", instant: false },
			{ type: "MOVE", direction: "next", instant: false },
			{ type: "MOVE", direction: "prev", instant: false },
		);
		expect(state.slide).toBe(2);
	});

	test("instant moves wrap without entering the sliding state", () => {
		const state = run({ type: "MOVE", direction: "prev", instant: true });
		expect(state).toMatchObject({ status: "idle", slide: 3 });
	});
});
