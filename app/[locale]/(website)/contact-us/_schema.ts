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

export const fieldNameSchema = z.enum(["name", "email", "topic", "message"]);

export type FieldName = z.infer<typeof fieldNameSchema>;

export const fieldNames = fieldNameSchema.options;

export const errorKeySchema = z.enum([
	"nameRequired",
	"emailInvalid",
	"topicRequired",
	"messageRequired",
]);

export type ErrorKey = z.infer<typeof errorKeySchema>;

export type FieldErrors = Partial<Record<FieldName, ErrorKey>>;

export const contactFieldsSchema = z.object({
	name: z.string().trim().min(1, errorKeySchema.enum.nameRequired),
	email: z.string().trim().pipe(z.email(errorKeySchema.enum.emailInvalid)),
	topic: z.enum(topicSchema.options, errorKeySchema.enum.topicRequired),
	message: z.string().trim().min(1, errorKeySchema.enum.messageRequired),
});
