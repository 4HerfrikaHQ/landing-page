import { X } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Course } from "../../../_helpers";
import type { CompletionPolicy } from "../../../_schema";
import { localizedPath } from "../../../sign-in/_helpers";
import { coursePath, courseProgressPercent } from "../../_helpers";
import type { LessonPosition } from "../_helpers";
import { LessonSidebar } from "./lesson-sidebar";
import { ProgressBar } from "./progress-bar";

type Props = {
	course: Course;
	policy: CompletionPolicy;
	completed: ReadonlySet<string>;
	currentKey: string;
	position: LessonPosition;
	children: ReactNode;
};

export function LessonShell({
	course,
	policy,
	completed,
	currentKey,
	position,
	children,
}: Props) {
	const t = useTranslations("academy.lesson");
	const locale = useLocale();
	const percent = courseProgressPercent(course, policy, completed);
	const courseHref = localizedPath(locale, coursePath(course.uid));

	return (
		<main className="min-h-[calc(100dvh-4rem)] bg-white lg:min-h-[calc(100dvh-5.625rem)]">
			<div className="mx-auto grid max-w-7xl lg:grid-cols-[19rem_minmax(0,1fr)]">
				<LessonSidebar
					course={course}
					policy={policy}
					completed={completed}
					currentKey={currentKey}
				/>
				<div className="flex min-w-0 flex-col px-5 pb-0 lg:px-10">
					<header className="flex items-center gap-4 py-4">
						<Link
							href={courseHref as Route}
							aria-label={t("close")}
							className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-indigo text-secondary-500 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary-500 lg:hidden"
						>
							<X className="size-5" aria-hidden />
						</Link>
						<div className="flex min-w-0 flex-1 flex-col gap-1.5">
							<p className="truncate text-sm text-muted-foreground">
								<Link
									href={courseHref as Route}
									className="hidden text-secondary-500 underline-offset-4 hover:underline lg:inline"
								>
									{course.title}
								</Link>
								<span aria-hidden className="hidden lg:inline">
									{" / "}
								</span>
								{t("position", {
									module: position.moduleNumber,
									lesson: position.lessonNumber,
									count: position.lessonCount,
								})}
							</p>
							<div className="lg:hidden">
								<ProgressBar
									percent={percent}
									label={t("courseLabel")}
									trackClass="bg-surface-indigo"
								/>
							</div>
						</div>
						<Link
							href={courseHref as Route}
							className="hidden items-center gap-1 text-sm font-semibold text-secondary-500 hover:underline lg:flex"
						>
							{t("close")}
							<X className="size-4" aria-hidden />
						</Link>
					</header>
					<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pb-0 pt-2">
						{children}
					</div>
				</div>
			</div>
		</main>
	);
}
