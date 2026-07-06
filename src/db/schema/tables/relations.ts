import { relations } from "drizzle-orm";
import { availability } from "./availability";
import { mentors } from "./mentors";
import { users } from "./users";

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
	availability: many(availability),
	user: one(users, {
		fields: [mentors.user_id],
		references: [users.id],
	}),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
	mentor: one(mentors, {
		fields: [availability.mentor_id],
		references: [mentors.id],
	}),
}));
