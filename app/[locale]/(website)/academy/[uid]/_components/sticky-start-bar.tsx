import { useTranslations } from "next-intl";
import type { Course } from "../../_helpers";
import type { Viewer } from "../_viewer";
import { CourseAction } from "./course-action";

export function StickyStartBar({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	const t = useTranslations("academy.course");
	return (
		<div className="sticky bottom-0 z-40 -mx-5 border-t border-border bg-white/95 px-5 py-3 backdrop-blur-sm lg:hidden">
			<div className="mx-auto flex max-w-xl items-center gap-4">
				<p className="flex min-w-0 flex-1 flex-col text-sm">
					<span className="font-semibold text-secondary-500">
						{t("startFreeNote")}
					</span>
					<span className="text-xs text-muted-foreground">
						{t("startFreeHint")}
					</span>
				</p>
				<div className="shrink-0">
					<CourseAction course={course} viewer={viewer} />
				</div>
			</div>
		</div>
	);
}
