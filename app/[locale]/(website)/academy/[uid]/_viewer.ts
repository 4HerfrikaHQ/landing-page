import "server-only";
import { completedLessonIds, findEnrolment } from "../_enrolment";
import type { Course } from "../_helpers";
import { currentAuthUser, currentLearner } from "../_learner";
import type { CompletionPolicy } from "../_schema";

export type Viewer =
	| { kind: "signedOut" }
	| { kind: "needsDetails" }
	| { kind: "learner"; name: string }
	| {
			kind: "enrolled";
			name: string;
			policy: CompletionPolicy;
			finished: boolean;
			completed: ReadonlySet<string>;
	  };

export async function loadViewer(course: Course): Promise<Viewer> {
	const user = await currentAuthUser();
	if (!user) return { kind: "signedOut" };
	const learner = await currentLearner();
	if (!learner) return { kind: "needsDetails" };
	const name = learner.certificate_name.split(/\s+/)[0];
	const enrolment = await findEnrolment(learner.id, course.id);
	if (!enrolment) return { kind: "learner", name };
	return {
		kind: "enrolled",
		name,
		policy: enrolment.completion_policy,
		finished: enrolment.completed_at !== null,
		completed: await completedLessonIds(enrolment.id),
	};
}
