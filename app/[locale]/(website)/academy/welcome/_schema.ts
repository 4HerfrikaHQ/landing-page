import { z } from "zod";
import { NEXT_PATH_MAX_LENGTH } from "../sign-in/_schema";
import { COUNTRY_CODES } from "./_countries";

export const CERTIFICATE_NAME_MIN_LENGTH = 3;
export const CERTIFICATE_NAME_MAX_LENGTH = 120;
export const CAMPUS_MAX_LENGTH = 120;

export const CreateLearnerSchema = z.object({
	certificateName: z
		.string()
		.trim()
		.min(1, "name_required")
		.min(CERTIFICATE_NAME_MIN_LENGTH, "name_too_short")
		.max(CERTIFICATE_NAME_MAX_LENGTH, "name_too_long"),
	country: z.enum(COUNTRY_CODES, "country_required"),
	campus: z
		.string()
		.trim()
		.max(CAMPUS_MAX_LENGTH, "campus_too_long")
		.optional(),
	ageConfirmed: z.boolean().refine((confirmed) => confirmed, "age_required"),
	next: z.string().max(NEXT_PATH_MAX_LENGTH).optional(),
});

export type CreateLearnerInput = z.infer<typeof CreateLearnerSchema>;
