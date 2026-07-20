import { z } from "zod";

export const AcademyWaitlistSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().email(),
	phone: z.string().trim().min(5).max(40),
	academy: z.enum(["tech", "business", "climate"]),
	location: z.string().trim().min(2).max(120),
});
