import { z } from "zod";

export const SetFeaturedMentorSchema = z.object({
	mentorId: z.string().uuid(),
});

export const RequestMentorCalendarConnectionSchema = z.object({
	mentorId: z.string().uuid(),
});

export const MentorSortValue = z.enum(["name", "joined", "bookings"]);
export type MentorSortValue = z.infer<typeof MentorSortValue>;

export const MentorSortDirection = z.enum(["asc", "desc"]);
export type MentorSortDirection = z.infer<typeof MentorSortDirection>;

export const MentorStatusFilter = z.enum(["active", "inactive"]);
export type MentorStatusFilter = z.infer<typeof MentorStatusFilter>;

export const MentorCalendarFilter = z.enum(["connected", "not_connected"]);
export type MentorCalendarFilter = z.infer<typeof MentorCalendarFilter>;
