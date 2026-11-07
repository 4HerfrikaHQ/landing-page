import { z } from "zod";

export const carouselStatus = z.enum(["idle", "sliding"]);
export const carouselDirection = z.enum(["next", "prev"]);

export type CarouselDirection = z.infer<typeof carouselDirection>;

const CLONES_PER_SIDE = 1;
const FIRST_SLIDE = CLONES_PER_SIDE;

export type CarouselState = {
	status: z.infer<typeof carouselStatus>;
	slide: number;
	count: number;
};

export type CarouselEvent =
	| { type: "MOVE"; direction: CarouselDirection; instant: boolean }
	| { type: "SLIDE_END" };

export function withClones<T>(items: readonly T[]): T[] {
	return [
		...items.slice(-CLONES_PER_SIDE),
		...items,
		...items.slice(0, CLONES_PER_SIDE),
	];
}

export function initialCarouselState(count: number): CarouselState {
	return { status: carouselStatus.enum.idle, slide: FIRST_SLIDE, count };
}

function wrap(slide: number, count: number) {
	const lastSlide = FIRST_SLIDE + count - 1;
	if (slide < FIRST_SLIDE) return lastSlide;
	if (slide > lastSlide) return FIRST_SLIDE;
	return slide;
}

export function carouselReducer(
	state: CarouselState,
	event: CarouselEvent,
): CarouselState {
	switch (event.type) {
		case "MOVE": {
			if (state.status === carouselStatus.enum.sliding) return state;
			const slide =
				event.direction === carouselDirection.enum.next
					? state.slide + 1
					: state.slide - 1;
			if (event.instant) return { ...state, slide: wrap(slide, state.count) };
			return { ...state, status: carouselStatus.enum.sliding, slide };
		}
		case "SLIDE_END":
			return {
				...state,
				status: carouselStatus.enum.idle,
				slide: wrap(state.slide, state.count),
			};
	}
}
