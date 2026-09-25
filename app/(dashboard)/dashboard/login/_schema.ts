import { z } from "zod";

const LoginEmail = z
	.email("That doesn't look like an email address. Please check it.")
	.trim()
	.toLowerCase();

export const SendLoginCodeSchema = z.object({ email: LoginEmail });

export const VerifyLoginCodeSchema = z.object({
	email: LoginEmail,
	code: z.string().regex(/^\d{6}$/, "Enter all 6 digits of your code."),
});
