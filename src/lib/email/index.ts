import { MailpitEmailTransport } from "./mailpit";
import { ResendEmailTransport } from "./resend";
import type { EmailMessage, EmailTransport } from "./types";

export type { EmailMessage, EmailSendResult, EmailTransport } from "./types";

function transport(): EmailTransport {
	return process.env.EMAIL_TRANSPORT === "mailpit"
		? new MailpitEmailTransport()
		: new ResendEmailTransport();
}

export function sendEmail(message: EmailMessage) {
	return transport().send(message);
}
