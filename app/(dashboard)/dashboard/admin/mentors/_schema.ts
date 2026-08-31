import { z } from "zod";

export const SetFeaturedMentorSchema = z.object({
	mentorId: z.string().uuid(),
});

export const RequestMentorCalendarConnectionSchema = z.object({
	mentorId: z.string().uuid(),
});

export const MentorSortValue = z.enum(["name", "joined", "bookings"]);
export type MentorSortValue = z.infer<typeof MentorSortValue>;

export const MentorFeaturedFilter = z.enum(["featured", "not_featured"]);
export type MentorFeaturedFilter = z.infer<typeof MentorFeaturedFilter>;

export const MentorStatusFilter = z.enum(["active", "inactive"]);
export type MentorStatusFilter = z.infer<typeof MentorStatusFilter>;
