import { Resend } from "resend";
import type { EmailMessage, EmailSendResult, EmailTransport } from "./types";

export class ResendEmailTransport implements EmailTransport {
	async send(message: EmailMessage): Promise<EmailSendResult> {
		const resend = new Resend(process.env.RESEND_API_KEY);
		const result = await resend.emails.send(message);
		return {
			data: result.data?.id ? { id: result.data.id } : null,
			error: result.error ?? null,
		};
	}
}
