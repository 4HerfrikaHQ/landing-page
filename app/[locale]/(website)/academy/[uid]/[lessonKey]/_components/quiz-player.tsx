"use client";

import { useTranslations } from "next-intl";
import type { LearnerQuiz } from "../../../_helpers";
import { type QuizState, useQuiz } from "../_hooks/use-quiz";
import { ActionErrorText } from "./action-error-text";
import { PRIMARY_ACTION, SECONDARY_ACTION } from "./lesson-footer";
import { QuizQuestion } from "./quiz-question";
import { FailedView, PassedView } from "./quiz-result";

type Props = {
	uid: string;
	lessonKey: string;
	moduleNumber: number;
	quiz: LearnerQuiz;
	expectedAttempt: number;
	needed: number;
	initial: QuizState;
	failedScore: number | null;
	failedTopics: string[] | null;
	nextHref: string | null;
	courseHref: string;
	reviewHref: string;
};

export function QuizPlayer(props: Props) {
	const total = props.quiz.questions.length;
	const quiz = useQuiz({
		uid: props.uid,
		lessonKey: props.lessonKey,
		expectedAttempt: props.expectedAttempt,
		initial: props.initial,
	});
	const { state } = quiz;
	const focusResult = props.initial.kind !== state.kind;
	const common = {
		focusOnMount: focusResult,
		needed: props.needed,
		total,
		nextHref: props.nextHref,
		courseHref: props.courseHref,
		reviewHref: props.reviewHref,
	};

	if (state.kind === "result" && state.result.kind === "passed") {
		return <PassedView {...common} result={state.result} quiz={props.quiz} />;
	}
	if (state.kind === "result" && state.result.kind === "failed") {
		return (
			<FailedView
				{...common}
				correct={state.result.correctCount}
				topics={state.result.missedTopics}
				retryAtMs={state.result.retryAtMs}
				onRetry={quiz.retry}
			/>
		);
	}
	if (state.kind === "blocked") {
		return (
			<FailedView
				{...common}
				correct={props.failedScore}
				topics={props.failedTopics}
				retryAtMs={state.retryAtMs}
				onRetry={quiz.retry}
			/>
		);
	}
	if (state.kind === "stale") return <StaleNotice />;
	return <Answering props={props} quiz={quiz} total={total} />;
}

function StaleNotice() {
	const t = useTranslations("academy.lesson.quiz");
	return (
		<output className="rounded-2xl bg-surface-indigo p-4 text-secondary-500">
			{t("alreadySent")}
		</output>
	);
}

function indexOf(state: QuizState, total: number) {
	return state.kind === "answering" ? state.index : total - 1;
}

function Answering({
	props,
	quiz,
	total,
}: {
	props: Props;
	quiz: ReturnType<typeof useQuiz>;
	total: number;
}) {
	const t = useTranslations("academy.lesson.quiz");
	const { state } = quiz;
	const index = indexOf(state, total);
	const question = props.quiz.questions[index];
	const answers =
		state.kind === "answering" ||
		state.kind === "submitting" ||
		state.kind === "error"
			? state.answers
			: {};
	const busy = state.kind === "submitting";
	const isLast = index === total - 1;
	const moved = state.kind === "answering" && state.moved;
	const selected = answers[question.key];

	return (
		<section className="flex flex-1 flex-col gap-6">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-semibold tracking-wide text-primary-700 uppercase">
					{t("label", { number: props.moduleNumber })}
				</p>
				<QuizProgress
					index={index}
					keys={props.quiz.questions.map((item) => item.key)}
				/>
			</div>
			<QuizQuestion
				key={question.key}
				question={question}
				selected={selected}
				focusOnMount={moved}
				disabled={busy}
				onSelect={(option) => quiz.select(question.key, option)}
			/>
			<div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:justify-between">
				<BackButton
					index={index}
					disabled={busy}
					onBack={() => quiz.go(index - 1)}
				/>
				<NextButton
					isLast={isLast}
					busy={busy}
					disabled={selected === undefined}
					onNext={() => quiz.go(index + 1)}
					onSubmit={quiz.submit}
				/>
			</div>
			<ErrorText state={state} />
		</section>
	);
}

function ErrorText({ state }: { state: QuizState }) {
	if (state.kind !== "error") return null;
	return <ActionErrorText code={state.code} />;
}

function QuizProgress({ index, keys }: { index: number; keys: string[] }) {
	const t = useTranslations("academy.lesson.quiz");
	const total = keys.length;
	return (
		<div className="flex items-center gap-3">
			<progress
				className="sr-only"
				aria-label={t("progressLabel")}
				value={index + 1}
				max={total}
			/>
			<div aria-hidden className="flex flex-1 gap-1">
				{keys.map((key, position) => (
					<span
						key={key}
						className={`h-1.5 flex-1 rounded-full ${
							position <= index ? "bg-primary-500" : "bg-surface-indigo"
						}`}
					/>
				))}
			</div>
			<p className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
				{t("progress", { current: index + 1, total })}
			</p>
		</div>
	);
}

function BackButton({
	index,
	disabled,
	onBack,
}: {
	index: number;
	disabled: boolean;
	onBack: () => void;
}) {
	const t = useTranslations("academy.lesson.quiz");
	if (index === 0) return null;
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onBack}
			className={`${SECONDARY_ACTION} disabled:opacity-50`}
		>
			{t("previousQuestion")}
		</button>
	);
}

function nextLabel(isLast: boolean, busy: boolean) {
	if (!isLast) return "nextQuestion";
	return busy ? "submitting" : "submit";
}

function ChooseHint({ visible }: { visible: boolean }) {
	const t = useTranslations("academy.lesson.quiz");
	if (!visible) return null;
	return (
		<p id="choose-hint" className="text-sm text-muted-foreground">
			{t("chooseToContinue")}
		</p>
	);
}

function NextButton({
	isLast,
	busy,
	disabled,
	onNext,
	onSubmit,
}: {
	isLast: boolean;
	busy: boolean;
	disabled: boolean;
	onNext: () => void;
	onSubmit: () => void;
}) {
	const t = useTranslations("academy.lesson.quiz");
	const label = nextLabel(isLast, busy);
	return (
		<div className="flex flex-col items-stretch gap-2 lg:ml-auto lg:items-end">
			<button
				type="button"
				disabled={disabled || busy}
				aria-describedby={disabled ? "choose-hint" : undefined}
				onClick={isLast ? onSubmit : onNext}
				className={PRIMARY_ACTION}
			>
				{t(label)}
			</button>
			<ChooseHint visible={disabled} />
		</div>
	);
}
