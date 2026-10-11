import { z } from "zod";

const LoginEmail = z.email("invalid_email").trim().toLowerCase();

export const SendLoginCodeSchema = z.object({ email: LoginEmail });

export const VerifyLoginCodeSchema = z.object({
	email: LoginEmail,
	code: z.string().regex(/^\d{6}$/, "incomplete_code"),
});
