import { relations } from "drizzle-orm";
import { availability } from "./availability";
import { certificates } from "./certificates";
import { enrolments } from "./enrolments";
import { learners } from "./learners";
import { lessonProgress } from "./lesson-progress";
import {
	mentorGoogleConnections,
	mentorGoogleOAuthStates,
} from "./mentor-google-connections";
import { mentors } from "./mentors";
import { quizAttempts } from "./quiz-attempts";
import { taskSubmissions } from "./task-submissions";
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

export const learnersRelations = relations(learners, ({ many }) => ({
	enrolments: many(enrolments),
}));

export const enrolmentsRelations = relations(enrolments, ({ one, many }) => ({
	learner: one(learners, {
		fields: [enrolments.learner_id],
		references: [learners.id],
	}),
	lessonProgress: many(lessonProgress),
	quizAttempts: many(quizAttempts),
	taskSubmissions: many(taskSubmissions),
	certificate: one(certificates),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
	enrolment: one(enrolments, {
		fields: [lessonProgress.enrolment_id],
		references: [enrolments.id],
	}),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
	enrolment: one(enrolments, {
		fields: [quizAttempts.enrolment_id],
		references: [enrolments.id],
	}),
}));

export const taskSubmissionsRelations = relations(
	taskSubmissions,
	({ one }) => ({
		enrolment: one(enrolments, {
			fields: [taskSubmissions.enrolment_id],
			references: [enrolments.id],
		}),
		reviewer: one(users, {
			fields: [taskSubmissions.reviewed_by],
			references: [users.id],
		}),
	}),
);

export const certificatesRelations = relations(certificates, ({ one }) => ({
	enrolment: one(enrolments, {
		fields: [certificates.enrolment_id],
		references: [enrolments.id],
	}),
}));
