import type { EmailMessage, EmailSendResult, EmailTransport } from "./types";

const MAILPIT_URL = "http://127.0.0.1:54324";

function address(value: string): { Email: string; Name?: string } {
	const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
	if (!match) return { Email: value.trim() };
	return { Email: match[2].trim(), Name: match[1].trim() || undefined };
}

export class MailpitEmailTransport implements EmailTransport {
	async send(message: EmailMessage): Promise<EmailSendResult> {
		const recipients = Array.isArray(message.to) ? message.to : [message.to];
		const response = await fetch(`${MAILPIT_URL}/api/v1/send`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				From: address(message.from),
				To: recipients.map(address),
				Subject: message.subject,
				Text: message.text,
				HTML: message.html,
				Attachments: message.attachments?.map((attachment) => ({
					Filename: attachment.filename,
					Content: attachment.content,
					ContentType: attachment.contentType,
				})),
			}),
		});
		if (!response.ok) {
			throw new Error(`Mailpit email failed with status ${response.status}`);
		}
		const result = (await response.json()) as { ID?: string };
		return {
			data: result.ID ? { id: result.ID } : null,
			error: null,
		};
	}
}
