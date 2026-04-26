import { relations } from "drizzle-orm";
import { mentors } from "./mentors";
import { availability } from "./availability";

export const mentorsRelations = relations(mentors, ({ many }) => ({
	availability: many(availability),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
	mentor: one(mentors, {
		fields: [availability.mentor_id],
		references: [mentors.id],
	}),
}));
