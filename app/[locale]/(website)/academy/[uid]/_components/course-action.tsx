import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import type { Course } from "../../_helpers";
import { localizedPath, signInPath, welcomePath } from "../../sign-in/_helpers";
import {
	completePath,
	coursePath,
	firstLesson,
	lessonPath,
	nextLesson,
} from "../_helpers";
import type { Viewer } from "../_viewer";
import { EnrolButton } from "./enrol-button";

const ACTION_CLASS =
	"min-h-12 w-full gap-2 whitespace-normal text-center text-base md:py-3 md:text-base";

export function CourseAction({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	const t = useTranslations("academy.course");
	const locale = useLocale();
	const target = localizedPath(locale, coursePath(course.uid));

	if (viewer.kind === "signedOut") {
		return (
			<Button
				href={signInPath(locale, target)}
				size="lg"
				className={ACTION_CLASS}
			>
				{t("startFree")}
			</Button>
		);
	}
	if (viewer.kind === "needsDetails") {
		return (
			<Button
				href={welcomePath(locale, target)}
				size="lg"
				className={ACTION_CLASS}
			>
				{t("startFree")}
			</Button>
		);
	}
	if (viewer.kind === "learner") return <EnrolButton uid={course.uid} />;

	if (viewer.finished) {
		return (
			<Button
				href={localizedPath(locale, completePath(course.uid))}
				size="lg"
				className={ACTION_CLASS}
			>
				{t("viewCertificate")} <ArrowRight className="size-4" />
			</Button>
		);
	}
	const next = nextLesson(course, viewer.policy, viewer.completed);
	const lesson = next ?? firstLesson(course);
	const label = next ? t("continue") : t("review");
	const href = localizedPath(
		locale,
		lesson ? lessonPath(course.uid, lesson.key) : coursePath(course.uid),
	);
	return (
		<Button href={href as Route} size="lg" className={ACTION_CLASS}>
			{label} <ArrowRight className="size-4" />
		</Button>
	);
}
