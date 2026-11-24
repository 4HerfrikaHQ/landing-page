"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
import { submitQuiz } from "../_actions/quiz";
import type { QuizResult } from "../_quiz";

export type QuizState =
	| {
			kind: "answering";
			index: number;
			answers: Record<string, number>;
			moved: boolean;
	  }
	| { kind: "submitting"; answers: Record<string, number> }
	| { kind: "stale" }
	| { kind: "blocked"; retryAtMs: number }
	| { kind: "result"; result: QuizResult }
	| {
			kind: "error";
			answers: Record<string, number>;
			code: string | undefined;
	  };

type Event =
	| { type: "select"; key: string; option: number }
	| { type: "go"; index: number }
	| { type: "submitting" }
	| { type: "stale" }
	| { type: "blocked"; retryAtMs: number }
	| { type: "graded"; result: QuizResult }
	| { type: "failed"; code: string | undefined };

function answersOf(state: QuizState): Record<string, number> {
	if (state.kind === "answering" || state.kind === "submitting") {
		return state.answers;
	}
	if (state.kind === "error") return state.answers;
	return {};
}

function reducer(state: QuizState, event: Event): QuizState {
	switch (event.type) {
		case "select":
			if (state.kind !== "answering") return state;
			return {
				...state,
				answers: { ...state.answers, [event.key]: event.option },
			};
		case "go":
			if (state.kind !== "answering") return state;
			return { ...state, index: event.index, moved: true };
		case "submitting":
			return { kind: "submitting", answers: answersOf(state) };
		case "stale":
			return { kind: "stale" };
		case "blocked":
			return { kind: "blocked", retryAtMs: event.retryAtMs };
		case "graded":
			return { kind: "result", result: event.result };
		case "failed":
			return { kind: "error", answers: answersOf(state), code: event.code };
	}
}

type Input = {
	uid: string;
	lessonKey: string;
	expectedAttempt: number;
	questionCount: number;
	initial: QuizState;
};

export function useQuiz(input: Input) {
	const router = useRouter();
	const [state, dispatch] = useReducer(reducer, input.initial);

	async function submit() {
		if (state.kind !== "answering" && state.kind !== "error") return;
		const answers = answersOf(state);
		dispatch({ type: "submitting" });
		const response = await submitQuiz({
			uid: input.uid,
			lessonKey: input.lessonKey,
			expectedAttempt: input.expectedAttempt,
			answers,
		});
		const data = response?.data;
		if (!data) {
			dispatch({ type: "failed", code: response?.serverError });
			return;
		}
		if (data.kind === "graded") {
			dispatch({ type: "graded", result: data.result });
			return;
		}
		if (data.kind === "blocked") {
			dispatch({ type: "blocked", retryAtMs: data.retryAtMs });
			return;
		}
		dispatch({ type: "stale" });
		router.refresh();
	}

	return {
		state,
		select: (key: string, option: number) =>
			dispatch({ type: "select", key, option }),
		go: (index: number) => dispatch({ type: "go", index }),
		submit,
		retry: () => router.refresh(),
		navigate: (href: string) => router.push(href as Route),
	};
}
