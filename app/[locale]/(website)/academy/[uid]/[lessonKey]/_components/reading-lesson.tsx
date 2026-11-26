import { getTranslations } from "next-intl/server";
import { getLessonContent } from "../_content";
import type { LessonViewProps } from "../_view";
import { CompleteButton } from "./complete-button";
import { LessonFooter } from "./lesson-footer";
import { Badge, LessonHeading } from "./lesson-heading";
import { RichBody } from "./rich-body";

export async function ReadingLesson({ view }: { view: LessonViewProps }) {
	const { access, nav } = view;
	const { lesson, enrolment, completed } = access;
	const [content, t] = await Promise.all([
		getLessonContent(lesson.id),
		getTranslations("academy.lesson.reading"),
	]);
	if (content.kind !== "reading") return null;
	const minutes = content.minutes ?? lesson.minutes;
	const label = enrolment.completion_policy.readingAck
		? "markRead"
		: "continue";
	return (
		<>
			<LessonHeading title={lesson.title}>
				<Badge>{minutes ? t("badge", { minutes }) : t("badgeNoTime")}</Badge>
			</LessonHeading>
			<ReadingBody body={content.body} empty={t("empty")} />
			<p className="rounded-2xl bg-surface-indigo p-4 text-base text-muted-foreground">
				{t("noTimer")}
			</p>
			<LessonFooter previousHref={nav.previousHref}>
				<CompleteButton
					uid={access.course.uid}
					lessonKey={lesson.key}
					label={label}
					completed={completed.has(lesson.id)}
					enabled
					nextHref={nav.continueHref}
					courseHref={nav.courseHref}
				/>
			</LessonFooter>
		</>
	);
}

function ReadingBody({
	body,
	empty,
}: {
	body: Parameters<typeof RichBody>[0]["field"] | null;
	empty: string;
}) {
	if (!body) return <p className="text-lg text-muted-foreground">{empty}</p>;
	return <RichBody field={body} />;
}
