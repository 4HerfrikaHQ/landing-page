import {
	AlignLeft,
	Check,
	CircleHelp,
	Lock,
	type LucideIcon,
	PenLine,
	Play,
} from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { Course } from "../../../_helpers";
import type { CompletionPolicy, LessonKind } from "../../../_schema";
import { localizedPath } from "../../../sign-in/_helpers";
import {
	courseProgressPercent,
	lessonPath,
	moduleStates,
} from "../../_helpers";
import { ProgressBar } from "./progress-bar";

const KIND_ICON: Record<LessonKind, LucideIcon> = {
	video: Play,
	reading: AlignLeft,
	quiz: CircleHelp,
	task: PenLine,
};

type Props = {
	course: Course;
	policy: CompletionPolicy;
	completed: ReadonlySet<string>;
	currentKey: string;
};

function LessonIcon({
	kind,
	done,
	locked,
}: {
	kind: LessonKind;
	done: boolean;
	locked: boolean;
}) {
	if (locked) return <Lock className="size-4 shrink-0" aria-hidden />;
	if (done)
		return <Check className="size-4 shrink-0 text-primary-700" aria-hidden />;
	const Icon = KIND_ICON[kind];
	return <Icon className="size-4 shrink-0" aria-hidden />;
}

export function LessonSidebar({
	course,
	policy,
	completed,
	currentKey,
}: Props) {
	const t = useTranslations("academy.lesson");
	const kinds = useTranslations("academy.course.kinds");
	const locale = useLocale();
	const states = moduleStates(course, policy, completed);
	const percent = courseProgressPercent(course, policy, completed);

	return (
		<aside
			aria-label={t("sidebarTitle")}
			className="hidden border-r border-border bg-surface-pink/60 lg:block"
		>
			<div className="sticky top-22.5 flex max-h-[calc(100dvh-5.625rem)] flex-col gap-5 overflow-y-auto p-5">
				<div className="flex flex-col gap-2">
					<p className="text-base font-semibold text-secondary-500">
						{course.title}
					</p>
					<div className="flex items-center justify-between text-sm text-secondary-500">
						<span>{t("courseLabel")}</span>
						<span>{t("percentDone", { percent })}</span>
					</div>
					<ProgressBar
						percent={percent}
						label={t("courseLabel")}
						trackClass="bg-white"
					/>
				</div>
				<ol className="flex flex-col gap-4">
					{course.modules.map((module, index) => {
						const locked = states.get(module.key) === "locked";
						return (
							<li key={module.key} className="flex flex-col gap-1">
								<p className="text-xs font-semibold tracking-wide text-secondary-500 uppercase">
									{t("moduleLabel", { number: index + 1 })} · {module.title}
								</p>
								<ul className="flex flex-col gap-1">
									{module.lessons.map((lesson) => {
										const current = lesson.key === currentKey;
										const row = `flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
											current
												? "border-primary-500 bg-white font-semibold text-secondary-500"
												: "border-transparent text-secondary-500"
										}`;
										const label = (
											<>
												<LessonIcon
													kind={lesson.kind}
													done={completed.has(lesson.id)}
													locked={locked}
												/>
												<span className="min-w-0">
													{kinds(lesson.kind)} · {lesson.title}
												</span>
											</>
										);
										if (locked) {
											return (
												<li key={lesson.id}>
													<span
														aria-disabled="true"
														title={t("lockedLesson")}
														className={`${row} opacity-60`}
													>
														{label}
													</span>
												</li>
											);
										}
										return (
											<li key={lesson.id}>
												<Link
													href={
														localizedPath(
															locale,
															lessonPath(course.uid, lesson.key),
														) as Route
													}
													aria-current={current ? "page" : undefined}
													className={`${row} hover:bg-white focus-visible:outline-2 focus-visible:outline-primary-500`}
												>
													{label}
												</Link>
											</li>
										);
									})}
								</ul>
							</li>
						);
					})}
				</ol>
			</div>
		</aside>
	);
}
