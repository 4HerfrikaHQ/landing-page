"use client";

import { useHookFormAction as useHookFormActionBase } from "@next-safe-action/adapter-react-hook-form/hooks";
import type { SafeActionFn } from "next-safe-action";
import type { InferUseActionHookReturn } from "next-safe-action/hooks";
import type { BaseSyntheticEvent } from "react";
import type { Resolver, UseFormProps, UseFormReturn } from "react-hook-form";

/**
 * Typed wrapper for the next-safe-action RHF adapter's `useHookFormAction`.
 *
 * The adapter's vendored `StandardSchemaV1` doesn't match zod v4's `~standard`, so its
 * inference collapses the schema to `unknown`/`never` and forms type as `any`. We
 * re-derive the generics off the action type and cast internally — public types stay
 * precise, runtime is unchanged.
 */

// biome-ignore lint/suspicious/noExplicitAny: positional slots we don't read
type Any = any;

type AnyAction = (...args: Any[]) => Promise<Any>;

type Schema<A> = A extends SafeActionFn<Any, infer S, Any, Any, Any>
	? S
	: never;
type ServerErr<A> = A extends SafeActionFn<infer SE, Any, Any, Any, Any>
	? SE
	: never;
type ActionData<A> = A extends SafeActionFn<Any, Any, Any, Any, infer D>
	? D
	: never;

// Structural Standard Schema reads — independent of any vendored `StandardSchemaV1`.
type StdInput<S> = S extends { "~standard": { types?: { input: infer I } } }
	? I
	: never;
type StdOutput<S> = S extends { "~standard": { types?: { output: infer O } } }
	? O
	: never;

type FormInput<A> = StdInput<Schema<A>> extends infer I
	? I extends Record<string, Any>
		? I
		: never
	: never;
type FormOutput<A> = StdOutput<Schema<A>>;

type HookReturn<A extends AnyAction> = {
	form: UseFormReturn<FormInput<A>, unknown, FormOutput<A>>;
	action: InferUseActionHookReturn<A>;
	handleSubmitWithAction: (e?: BaseSyntheticEvent) => Promise<void>;
	resetFormAndAction: () => void;
};

type HookProps<A extends AnyAction> = {
	formProps?: Omit<
		UseFormProps<FormInput<A>, unknown, FormOutput<A>>,
		"resolver"
	>;
	actionProps?: {
		onExecute?: (args: { input: FormOutput<A> }) => void;
		onSuccess?: (args: { data?: ActionData<A>; input: FormOutput<A> }) => void;
		onError?: (args: {
			error: {
				serverError?: ServerErr<A>;
				validationErrors?: unknown;
				bindArgsValidationErrors?: unknown;
			};
			input: FormOutput<A>;
		}) => void;
		onSettled?: (args: { result: unknown; input: FormOutput<A> }) => void;
	};
	errorMapProps?: { joinBy?: string };
};

export function useHookFormAction<A extends AnyAction>(
	action: A,
	hookFormResolver: Resolver<FormInput<A>, unknown, FormOutput<A>>,
	props?: HookProps<A>,
): HookReturn<A> {
	return useHookFormActionBase(
		action as never,
		hookFormResolver as never,
		props as never,
	) as HookReturn<A>;
}
