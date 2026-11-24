"use client";

import {
	type ReactNode,
	type TransitionStartFunction,
	createContext,
	use,
	useMemo,
	useTransition,
} from "react";

type DirectoryTransition = {
	isPending: boolean;
	startTransition: TransitionStartFunction;
};

const DirectoryTransitionContext = createContext<DirectoryTransition | null>(
	null,
);

export function DirectoryTransitionProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [isPending, startTransition] = useTransition();
	const value = useMemo(() => ({ isPending, startTransition }), [isPending]);

	return (
		<DirectoryTransitionContext value={value}>
			{children}
		</DirectoryTransitionContext>
	);
}

export function useDirectoryTransition() {
	const value = use(DirectoryTransitionContext);
	if (!value) {
		throw new Error(
			"useDirectoryTransition must be used inside DirectoryTransitionProvider",
		);
	}
	return value;
}
