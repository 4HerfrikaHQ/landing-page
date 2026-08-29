/**
 * Shared motion tokens.
 *
 * The primitives used to each pick their own duration, easing and travel
 * distance (0.6s/40px here, 0.5s/30px there, 0.4s/20px elsewhere), which read
 * as four different personalities on one page. One set of values, used
 * everywhere, is what makes the site feel like a single piece of software.
 *
 * The entrance curve is a strong ease-out: most of the distance is covered in
 * the first third of the animation, so the element reads as "already arriving"
 * rather than drifting into place. Long travel over a long duration is what
 * makes an entrance feel floaty, so both are deliberately small.
 */

/** Entrance easing. Fast out of the gate, long soft settle. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Interaction easing, for hover/tap state changes. */
export const EASE_INTERACTION = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
	/** Section-level entrances. */
	enter: 0.45,
	/** Items inside a stagger — slightly quicker so the run doesn't drag. */
	item: 0.35,
	/** Hover, tap, and other direct-manipulation feedback. */
	interaction: 0.2,
} as const;

/** Entrance travel in px. Small on purpose — see the note above. */
export const TRAVEL = 16;

/** Gap between staggered children. */
export const STAGGER = 0.06;

/**
 * Viewport config for scroll-triggered entrances. A negative bottom margin
 * only delays the trigger until the element is already well inside the
 * viewport, which is what makes reveals feel like they are lagging behind the
 * scroll; firing slightly *before* the element is fully on screen is what
 * reads as responsive.
 */
export const VIEWPORT = { once: true, margin: "0px 0px -8% 0px" } as const;
