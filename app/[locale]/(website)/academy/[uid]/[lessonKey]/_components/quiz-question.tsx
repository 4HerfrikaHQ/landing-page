"use client";

import { useTranslations } from "next-intl";
import type { LearnerQuiz } from "../../../_helpers";

type Question = LearnerQuiz["questions"][number];

type Props = {
	question: Question;
	selected: number | undefined;
	focusOnMount: boolean;
	disabled: boolean;
	onSelect: (option: number) => void;
};

function focusElement(shouldFocus: boolean) {
	return (element: HTMLElement | null) => {
		if (shouldFocus) element?.focus();
	};
}

export function QuizQuestion({
	question,
	selected,
	focusOnMount,
	disabled,
	onSelect,
}: Props) {
	const t = useTranslations("academy.lesson.quiz");
	const headingId = `question-${question.key}`;
	return (
		<div className="flex flex-col gap-5">
			<h2
				id={headingId}
				ref={focusElement(focusOnMount)}
				tabIndex={-1}
				className="text-2xl leading-snug font-semibold text-secondary-500 outline-none lg:text-3xl"
			>
				{question.prompt}
			</h2>
			<fieldset aria-labelledby={headingId} className="flex flex-col gap-3">
				<legend className="sr-only">{t("choose")}</legend>
				{question.options.map((option) => (
					<label key={option.index} className="relative block cursor-pointer">
						<input
							type="radio"
							name={question.key}
							value={option.index}
							checked={selected === option.index}
							disabled={disabled}
							onChange={() => onSelect(option.index)}
							className="peer sr-only"
						/>
						<span className="flex min-h-14 items-center gap-4 rounded-2xl border border-border bg-white px-4 py-3 text-lg text-secondary-500 motion-safe:transition-colors peer-checked:border-2 peer-checked:border-primary-500 peer-checked:bg-surface-pink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 peer-disabled:opacity-60">
							<span
								aria-hidden
								className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground peer-checked:border-primary-500"
							>
								{selected === option.index ? (
									<span className="size-3 rounded-full bg-primary-500" />
								) : null}
							</span>
							{option.text}
						</span>
					</label>
				))}
			</fieldset>
		</div>
	);
}
