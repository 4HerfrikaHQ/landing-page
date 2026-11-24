"use client";

import { SearchInput } from "@/components/dashboard/filter-bar";
import { useDirectoryTransition } from "./directory-transition";

const RESULTS_ID = "mentors";

export function HeroSearch({
	label,
	placeholder,
}: {
	label: string;
	placeholder: string;
}) {
	const { isPending, startTransition } = useDirectoryTransition();

	return (
		<search className="mt-1 w-full max-w-xl text-foreground">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					document.getElementById(RESULTS_ID)?.scrollIntoView({
						behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
							.matches
							? "auto"
							: "smooth",
					});
				}}
			>
				<SearchInput
					label={label}
					placeholder={placeholder}
					resetPageOnChange
					startTransition={startTransition}
					pending={isPending}
					className="w-full sm:w-full"
					inputClassName="h-14 border-0 pl-11 pr-5 text-base"
				/>
			</form>
		</search>
	);
}
