"use client";

import { sendGAEvent } from "@next/third-parties/google";

type AnalyticsEvents = {
	career_corner_viewed: { mentor_count: number };
	mentor_search: {
		search_term: string;
		result_count: number;
		available_only: boolean;
	};
	mentor_availability_filter_changed: {
		enabled: boolean;
		result_count: number;
	};
	mentor_details_viewed: {
		mentor_id: string;
		mentor_slug: string;
		mentor_name: string;
		mentor_role: string;
		has_availability: boolean;
	};
	mentor_booking_clicked: {
		mentor_id: string;
		mentor_slug: string;
		mentor_name: string;
		source: "mentor_details";
	};
	mentor_booking_page_viewed: {
		mentor_slug: string;
		mentor_name: string;
	};
	booking_slot_selected: { mentor_slug: string };
	booking_form_started: { mentor_slug: string };
	booking_submitted: { mentor_slug: string };
	booking_completed: { mentor_slug: string };
	booking_failed: { mentor_slug: string };
	booking_form_abandoned: { mentor_slug: string };
	academy_viewed: Record<string, never>;
	academy_waitlist_opened: {
		academy_type: AcademyType;
		source: "hero" | "academy_card" | "page_cta";
	};
	academy_selected: { academy_type: AcademyType };
	academy_waitlist_started: { academy_type: AcademyType };
	academy_waitlist_submitted: { academy_type: AcademyType };
	academy_waitlist_completed: { academy_type: AcademyType };
	academy_waitlist_failed: { academy_type: AcademyType };
};

export type AcademyType = "tech" | "business" | "climate";
export type AnalyticsEventName = keyof AnalyticsEvents;

export function trackEvent<Name extends AnalyticsEventName>(
	name: Name,
	...args: AnalyticsEvents[Name] extends Record<string, never>
		? [] | [AnalyticsEvents[Name]]
		: [AnalyticsEvents[Name]]
) {
	if (typeof window === "undefined") return;
	sendGAEvent("event", name, args[0] ?? {});
}
