import { z } from "zod";

export const SetFeaturedMentorSchema = z.object({
	mentorId: z.string().uuid(),
});
