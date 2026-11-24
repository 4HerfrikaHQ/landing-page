import type { LessonKind } from "../../../_schema";
import type { LessonViewProps } from "../_view";
import { QuizLesson } from "./quiz-lesson";
import { ReadingLesson } from "./reading-lesson";
import { TaskLesson } from "./task-lesson";
import { VideoLesson } from "./video-lesson";

const BODY: Record<
	LessonKind,
	(props: { view: LessonViewProps }) => Promise<React.ReactNode>
> = {
	video: VideoLesson,
	reading: ReadingLesson,
	quiz: QuizLesson,
	task: TaskLesson,
};

export async function LessonBody({ view }: { view: LessonViewProps }) {
	const Body = BODY[view.access.lesson.kind];
	return <Body view={view} />;
}
