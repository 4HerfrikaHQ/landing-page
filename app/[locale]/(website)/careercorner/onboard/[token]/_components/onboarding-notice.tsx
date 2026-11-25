import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function OnboardingNotice({
	tone,
	icon: Icon,
	title,
	description,
	actions,
}: {
	tone: "neutral" | "success";
	icon: LucideIcon;
	title: string;
	description: string;
	actions: ReactNode;
}) {
	return (
		<section
			className={cn(
				"rounded-[20px] p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] sm:p-10 lg:p-12",
				tone === "success" ? "bg-surface-pink" : "bg-white",
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"grid size-14 place-items-center rounded-full text-primary-500",
					tone === "success" ? "bg-white" : "bg-surface-pink",
				)}
			>
				<Icon className="size-7" strokeWidth={1.75} />
			</span>
			<h1 className="mt-6 text-[28px] font-bold leading-tight text-secondary-500 lg:text-4xl">
				{title}
			</h1>
			<p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground lg:text-lg">
				{description}
			</p>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
		</section>
	);
}
