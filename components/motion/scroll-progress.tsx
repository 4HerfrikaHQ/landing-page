import { cn } from "@/utils/cn";

export function ScrollProgress() {
	return (
		<div
			data-site-scroll-progress
			aria-hidden="true"
			className={cn(
				"fixed top-0 left-0 right-0 h-1 origin-left scale-x-0 bg-primary-500 z-[100]",
				"animate-scroll-progress",
			)}
		/>
	);
}
