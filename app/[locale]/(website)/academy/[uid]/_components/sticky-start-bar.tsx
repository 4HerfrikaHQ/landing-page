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
		<div className="sticky bottom-0 z-40 -mx-5 border-t border-border bg-white/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
			<div className="mx-auto flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2">
				<p className="flex min-w-40 flex-1 flex-col text-sm">
					<span className="font-semibold text-secondary-500">
						{t("startFreeNote")}
					</span>
					<span className="text-xs text-muted-foreground">
						{t("startFreeHint")}
					</span>
				</p>
				<div className="min-w-0 flex-1 basis-56">
					<CourseAction course={course} viewer={viewer} />
				</div>
			</div>
		</div>
	);
}
