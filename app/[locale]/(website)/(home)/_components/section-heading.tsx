import { cn } from "@/utils/cn";
import type { HeadingTone } from "../_schema";

const ACCENT: Record<HeadingTone, string> = {
	light: "text-primary-500",
	dark: "text-primary-bright",
};

type SectionHeadingProps = {
	eyebrow?: string;
	first: string;
	second: string;
	tone?: HeadingTone;
	breakLine?: boolean;
	className?: string;
};

function SectionEyebrow({ text }: { text: string | undefined }) {
	if (!text) return null;
	return (
		<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
			{text}
		</span>
	);
}

function LineBreak() {
	return <br />;
}

function Space() {
	return " ";
}

export function SectionHeading({
	eyebrow,
	first,
	second,
	tone = "light",
	breakLine = false,
	className,
}: SectionHeadingProps) {
	const Separator = breakLine ? LineBreak : Space;

	return (
		<div className={className}>
			<SectionEyebrow text={eyebrow} />
			<h2 className="mt-4 text-[36px] font-bold leading-tight lg:text-5xl">
				{first}
				<Separator />
				<em className={cn("font-playfair font-black", ACCENT[tone])}>
					{second}
				</em>
			</h2>
		</div>
	);
}
