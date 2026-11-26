"use client";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { LearnerQuiz } from "../../../_helpers";
import { formatCountdown } from "../../../sign-in/_helpers";
import { useSecondsUntil } from "../../../sign-in/_hooks/use-seconds-until";
import type { QuizResult, ReviewItem } from "../_quiz";
import { PRIMARY_ACTION, SECONDARY_ACTION } from "./lesson-footer";
import { focusElement } from "./quiz-question";

type Common = {
	focusOnMount: boolean;
	needed: number;
	total: number;
	nextHref: string | null;
	courseHref: string;
	reviewHref: string;
};

type FailedProps = Common & {
	correct: number | null;
	topics: string[] | null;
	retryAtMs: number | null;
	onRetry: () => void;
};

type PassedProps = Common & {
	result: Extract<QuizResult, { kind: "passed" }>;
	quiz: LearnerQuiz;
};

function ScoreBadge({
	label,
	caption,
	tone,
}: {
	label: string;
	caption: string;
	tone: "pass" | "fail";
}) {
	const style =
		tone === "pass"
			? "bg-[#1f7a4d] text-white"
			: "border-4 border-surface-indigo bg-surface-indigo/60 text-secondary-500";
	return (
		<div
			className={`flex size-36 flex-col items-center justify-center rounded-full ${style}`}
		>
			<span className="text-4xl font-semibold">{label}</span>
			<span className="text-sm">{caption}</span>
		</div>
	);
}

export function PassedView({
	result,
	quiz,
	needed,
	total,
	nextHref,
	courseHref,
	focusOnMount,
}: PassedProps) {
	const t = useTranslations("academy.lesson");
	const q = useTranslations("academy.lesson.quiz");
	return (
		<section className="flex flex-col items-center gap-6 text-center">
			<ScoreBadge
				tone="pass"
				label={q("scoreOf", {
					correct: result.correctCount,
					total: result.questionCount,
				})}
				caption={q("toPass", { needed })}
			/>
			<p className="rounded-full bg-[#e6f4ec] px-4 py-1 text-sm font-semibold text-[#1f7a4d]">
				{q("passedBadge")}
			</p>
			<h1
				ref={focusElement(focusOnMount)}
				tabIndex={-1}
				className="text-3xl font-semibold text-secondary-500 outline-none lg:text-4xl"
			>
				{q("passedTitle")}
			</h1>
			<p className="text-lg text-muted-foreground">
				{q("passedBody", { correct: result.correctCount, total })}
			</p>
			<FinishNote finished={result.finishedCourse} />
			<Review quiz={quiz} review={result.review} />
			<div className="flex w-full flex-col gap-3 lg:max-w-sm">
				<Link
					href={(nextHref ?? courseHref) as Route}
					className={PRIMARY_ACTION}
				>
					{nextHref ? q("nextLesson") : t("backToCourse")}
					<ArrowRight className="size-4" aria-hidden />
				</Link>
				<BackLink nextHref={nextHref} courseHref={courseHref} />
			</div>
		</section>
	);
}

function BackLink({
	nextHref,
	courseHref,
}: {
	nextHref: string | null;
	courseHref: string;
}) {
	const t = useTranslations("academy.lesson");
	if (!nextHref) return null;
	return (
		<Link
			href={courseHref as Route}
			className="inline-flex min-h-12 items-center justify-center font-semibold text-secondary-500 underline-offset-4 hover:underline"
		>
			{t("backToCourse")}
		</Link>
	);
}

function FinishNote({ finished }: { finished: boolean }) {
	const t = useTranslations("academy.lesson.finish");
	if (!finished) return null;
	return (
		<p className="rounded-2xl bg-surface-pink p-4 text-lg font-semibold text-secondary-500">
			{t("title")}. {t("body")}
		</p>
	);
}

function optionText(question: LearnerQuiz["questions"][number], index: number) {
	return question.options.find((option) => option.index === index)?.text ?? "";
}

function Review({
	quiz,
	review,
}: {
	quiz: LearnerQuiz;
	review: ReviewItem[] | null;
}) {
	const t = useTranslations("academy.lesson.quiz");
	if (!review) return null;
	const byKey = new Map(review.map((item) => [item.key, item]));
	return (
		<section className="flex w-full flex-col gap-3 text-left">
			<h2 className="text-base font-semibold text-secondary-500">
				{t("answersTitle")}
			</h2>
			<ol className="flex flex-col gap-3">
				{quiz.questions.map((question, index) => {
					const item = byKey.get(question.key);
					return (
						<li
							key={question.key}
							className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-base text-secondary-500"
						>
							<p className="text-muted-foreground">
								{index + 1}. {question.prompt}
							</p>
							<p className="font-semibold">
								<span className="sr-only">{t("correctAnswer")}: </span>
								<span aria-hidden>✓ </span>
								{item ? optionText(question, item.correctIndex) : ""}
							</p>
							<Why why={item?.why ?? null} />
						</li>
					);
				})}
			</ol>
		</section>
	);
}

function Why({ why }: { why: string | null }) {
	const t = useTranslations("academy.lesson.quiz");
	if (!why) return null;
	return (
		<p className="text-muted-foreground">
			<strong className="text-secondary-500">{t("why")}:</strong> {why}
		</p>
	);
}

function Topics({ topics }: { topics: string[] | null }) {
	const t = useTranslations("academy.lesson.quiz");
	if (!topics || topics.length === 0) return null;
	return (
		<section className="w-full rounded-2xl border border-border p-4 text-left">
			<h2 className="mb-2 text-base font-semibold text-secondary-500">
				{t("topicsTitle")}
			</h2>
			<ul className="flex list-disc flex-col gap-1 pl-5 text-base text-secondary-500">
				{topics.map((topic) => (
					<li key={topic}>{topic}</li>
				))}
			</ul>
		</section>
	);
}

function RetryBox({ retryAtMs }: { retryAtMs: number | null }) {
	const t = useTranslations("academy.lesson.quiz");
	const seconds = useSecondsUntil(retryAtMs ?? 0);
	return (
		<p
			role="timer"
			className="flex w-full items-center gap-4 rounded-2xl bg-surface-indigo p-4 text-left text-base text-secondary-500"
		>
			<span className="rounded-full bg-secondary-500 px-4 py-2 text-lg font-semibold text-white tabular-nums">
				{formatCountdown(seconds)}
			</span>
			{seconds > 0
				? t("retryIn", { time: formatCountdown(seconds) })
				: t("retryNow")}
		</p>
	);
}

function RetryBoxIfWaiting({ retryAtMs }: { retryAtMs: number | null }) {
	if (retryAtMs === null) return null;
	return <RetryBox retryAtMs={retryAtMs} />;
}

function RetryButton({
	retryAtMs,
	onRetry,
}: {
	retryAtMs: number | null;
	onRetry: () => void;
}) {
	const t = useTranslations("academy.lesson.quiz");
	const seconds = useSecondsUntil(retryAtMs ?? 0);
	const waiting = retryAtMs !== null && seconds > 0;
	return (
		<button
			type="button"
			disabled={waiting}
			onClick={onRetry}
			className={PRIMARY_ACTION}
		>
			{waiting
				? t("tryAgainIn", { time: formatCountdown(seconds) })
				: t("tryAgain")}
		</button>
	);
}

export function FailedView({
	correct,
	total,
	needed,
	topics,
	retryAtMs,
	onRetry,
	reviewHref,
	focusOnMount,
}: FailedProps) {
	const q = useTranslations("academy.lesson.quiz");
	return (
		<section className="flex flex-col items-center gap-6 text-center">
			<FailedScore correct={correct} total={total} needed={needed} />
			<h1
				ref={focusElement(focusOnMount)}
				tabIndex={-1}
				className="text-3xl font-semibold text-secondary-500 outline-none lg:text-4xl"
			>
				{q("failedTitle")}
			</h1>
			<p className="text-lg text-muted-foreground">
				{q("failedBody", { needed, total })}
			</p>
			<Topics topics={topics} />
			<RetryBoxIfWaiting retryAtMs={retryAtMs} />
			<div className="flex w-full flex-col gap-3 lg:max-w-sm">
				<RetryButton retryAtMs={retryAtMs} onRetry={onRetry} />
				<Link href={reviewHref as Route} className={SECONDARY_ACTION}>
					{q("reviewLesson")}
				</Link>
			</div>
		</section>
	);
}

function FailedScore({
	correct,
	total,
	needed,
}: {
	correct: number | null;
	total: number;
	needed: number;
}) {
	const q = useTranslations("academy.lesson.quiz");
	if (correct === null) return null;
	return (
		<ScoreBadge
			tone="fail"
			label={q("scoreOf", { correct, total })}
			caption={q("toPass", { needed })}
		/>
	);
}
