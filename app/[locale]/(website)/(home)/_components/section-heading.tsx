import { cn } from "@/utils/cn";

const ACCENT = {
	light: "text-primary-500",
	dark: "text-primary-bright",
} as const;

type SectionHeadingProps = {
	eyebrow?: string;
	first: string;
	second: string;
	tone?: keyof typeof ACCENT;
	breakLine?: boolean;
	className?: string;
};

export function SectionHeading({
	eyebrow,
	first,
	second,
	tone = "light",
	breakLine = false,
	className,
}: SectionHeadingProps) {
	return (
		<div className={className}>
			{eyebrow ? (
				<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{eyebrow}
				</span>
			) : null}
			<h2 className="mt-4 text-[36px] font-bold leading-tight lg:text-5xl">
				{first}
				{breakLine ? <br /> : " "}
				<em className={cn("font-playfair font-black", ACCENT[tone])}>
					{second}
				</em>
			</h2>
		</div>
	);
}
