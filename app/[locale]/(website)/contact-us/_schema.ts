import { z } from "zod";

export const FORMSPREE_FORM_KEY = "xovnjbdq";
export const MESSAGE_MAX_LENGTH = 1000;

export const topicSchema = z.enum([
	"partner",
	"press",
	"mentorship",
	"academy",
	"ambassador",
	"other",
]);

export type Topic = z.infer<typeof topicSchema>;

export const topics = topicSchema.options;

export const topicSubjects: Record<Topic, string> = {
	partner: "Partner with us",
	press: "Press and media",
	mentorship: "Mentorship help",
	academy: "Academy or certificate",
	ambassador: "Campus ambassador",
	other: "Something else",
};

export const QUICK_ANSWER_QUESTIONS = [
	"How can I find a mentor in my specific field?",
	"Who can join 4Herfrika?",
	"How should I prepare for my career coaching call?",
];

export const fieldNames = ["name", "email", "topic", "message"] as const;

export type FieldName = (typeof fieldNames)[number];

export type ErrorKey =
	| "nameRequired"
	| "emailInvalid"
	| "topicRequired"
	| "messageRequired";

export type FieldErrors = Partial<Record<FieldName, ErrorKey>>;

export const contactFieldsSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "nameRequired" satisfies ErrorKey),
	email: z
		.string()
		.trim()
		.pipe(z.email("emailInvalid" satisfies ErrorKey)),
	topic: z.enum(topicSchema.options, "topicRequired" satisfies ErrorKey),
	message: z
		.string()
		.trim()
		.min(1, "messageRequired" satisfies ErrorKey),
});
