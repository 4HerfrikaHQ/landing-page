export type EmailAddress = string | string[];

export type EmailAttachment = {
	filename: string;
	content: string;
	contentType?: string;
};

type EmailMessageBase = {
	from: string;
	to: EmailAddress;
	subject: string;
	attachments?: EmailAttachment[];
};

export type EmailMessage = EmailMessageBase &
	({ text: string; html?: string } | { html: string; text?: string });

export type EmailSendResult = {
	data: { id: string } | null;
	error: unknown | null;
};

export interface EmailTransport {
	send(message: EmailMessage): Promise<EmailSendResult>;
}
