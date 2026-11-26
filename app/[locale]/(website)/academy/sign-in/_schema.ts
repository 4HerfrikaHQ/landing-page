import { z } from "zod";

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;
export const NEXT_PATH_MAX_LENGTH = 2048;

const LearnerEmail = z.email("invalid_email").trim().toLowerCase();
const NextPath = z.string().max(NEXT_PATH_MAX_LENGTH).optional();

export const SendLearnerCodeSchema = z.object({
	email: LearnerEmail,
	next: NextPath,
});

export const VerifyLearnerCodeSchema = z.object({
	email: LearnerEmail,
	code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), "incomplete_code"),
	next: NextPath,
});

export const ContinueWithGoogleSchema = z.object({ next: NextPath });
