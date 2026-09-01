import { relations } from "drizzle-orm";
import { availability } from "./availability";
import {
	mentorGoogleConnections,
	mentorGoogleOAuthStates,
} from "./mentor-google-connections";
import { mentors } from "./mentors";
import { users } from "./users";

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
	availability: many(availability),
	googleConnection: one(mentorGoogleConnections),
	user: one(users, {
		fields: [mentors.user_id],
		references: [users.id],
	}),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	mentor: one(mentors),
	googleConnection: one(mentorGoogleConnections),
	googleOAuthStates: many(mentorGoogleOAuthStates),
}));

export const mentorGoogleConnectionsRelations = relations(
	mentorGoogleConnections,
	({ one }) => ({
		mentor: one(mentors, {
			fields: [mentorGoogleConnections.mentor_id],
			references: [mentors.id],
		}),
		user: one(users, {
			fields: [mentorGoogleConnections.user_id],
			references: [users.id],
		}),
	}),
);

export const mentorGoogleOAuthStatesRelations = relations(
	mentorGoogleOAuthStates,
	({ one }) => ({
		mentor: one(mentors, {
			fields: [mentorGoogleOAuthStates.mentor_id],
			references: [mentors.id],
		}),
		user: one(users, {
			fields: [mentorGoogleOAuthStates.user_id],
			references: [users.id],
		}),
	}),
);

export const availabilityRelations = relations(availability, ({ one }) => ({
	mentor: one(mentors, {
		fields: [availability.mentor_id],
		references: [mentors.id],
	}),
}));
