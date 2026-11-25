import { FadeIn } from "@/components/motion";
import { cn } from "@/utils/cn";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";
import { usageItems } from "../_data/brand-assets";
import {
	LOGO_HEIGHT_PX,
	LOGO_WIDTH_PX,
	MIN_LOGO_WIDTH_PX,
	type UsageId,
	type UsageKind,
	usageId,
	usageKind,
} from "../_schema";
import {
	CARD_CLASS,
	CONTAINER_CLASS,
	SECTION_CLASS,
	SectionHeading,
} from "./section-heading";

const BUSY_BACKGROUND_CLASS =
	"bg-[repeating-linear-gradient(45deg,#03065c_0_10px,#e20064_10px_20px,#ffffff_20px_30px)]";

function Logo({
	file = "4herfrika-logo",
	className,
	style,
}: { file?: string; className?: string; style?: React.CSSProperties }) {
	return (
		<Image
			src={`/brand/${file}.svg`}
			alt=""
			width={LOGO_WIDTH_PX}
			height={LOGO_HEIGHT_PX}
			unoptimized
			className={className}
			style={style}
		/>
	);
}

const PREVIEWS: Record<UsageId, { dark: boolean; node: ReactNode }> = {
	[usageId.enum.clearSpace]: {
		dark: false,
		node: (
			<div className="border border-dashed border-primary-500 p-4">
				<Logo className="h-8 w-auto" />
			</div>
		),
	},
	[usageId.enum.minSize]: {
		dark: false,
		node: (
			<div className="flex flex-col items-center gap-2">
				<Logo style={{ width: MIN_LOGO_WIDTH_PX }} />
				<span
					style={{ width: MIN_LOGO_WIDTH_PX }}
					className="h-px bg-primary-500"
				/>
				<span className="text-xs font-medium text-primary-500">
					{MIN_LOGO_WIDTH_PX}px
				</span>
			</div>
		),
	},
	[usageId.enum.onDark]: {
		dark: true,
		node: <Logo file="4herfrika-logo-on-dark" className="h-8 w-auto" />,
	},
	[usageId.enum.distort]: {
		dark: false,
		node: (
			<Logo
				className="h-8 w-auto"
				style={{ transform: "rotate(-8deg) scaleX(1.5) scaleY(0.8)" }}
			/>
		),
	},
	[usageId.enum.effects]: {
		dark: false,
		node: (
			<Logo
				className="h-8 w-auto"
				style={{ filter: "drop-shadow(4px 4px 3px rgba(226, 0, 100, 0.7))" }}
			/>
		),
	},
	[usageId.enum.busy]: {
		dark: true,
		node: <Logo className="h-8 w-auto" />,
	},
};

function UsageCard({ id, kind }: { id: UsageId; kind: UsageKind }) {
	const t = useTranslations("brand.usage");
	const preview = PREVIEWS[id];
	const isDo = kind === usageKind.enum.do;
	const KindIcon = isDo ? Check : X;
	const badgeClass = isDo ? "bg-emerald-700" : "bg-primary-500";
	const kindLabel = isDo ? t("doLabel") : t("dontLabel");
	const surfaceClass = preview.dark
		? "bg-secondary-500"
		: "border border-black/10 bg-white";
	const backgroundClass =
		id === usageId.enum.busy ? BUSY_BACKGROUND_CLASS : surfaceClass;

	return (
		<li className={cn(CARD_CLASS, "flex flex-col p-3")}>
			<div
				aria-hidden="true"
				className={cn(
					"relative flex h-32 items-center justify-center overflow-hidden rounded-[14px]",
					backgroundClass,
				)}
			>
				{preview.node}
			</div>
			<div className="flex items-start gap-3 p-3 pt-4">
				<span
					className={cn(
						"mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-white",
						badgeClass,
					)}
				>
					<KindIcon aria-hidden="true" className="size-4" />
				</span>
				<div>
					<h3 className="text-lg font-bold text-secondary-500">
						<span className="sr-only">{kindLabel}: </span>
						{t(`items.${id}.title`)}
					</h3>
					<p className="mt-1 text-[15px] leading-6 text-muted-foreground">
						{t(`items.${id}.text`)}
					</p>
				</div>
			</div>
		</li>
	);
}

export function UsageSection() {
	const t = useTranslations("brand.usage");

	return (
		<section
			aria-labelledby="brand-usage"
			className={cn(SECTION_CLASS, "bg-surface-indigo")}
		>
			<div className={CONTAINER_CLASS}>
				<FadeIn>
					<SectionHeading
						id="brand-usage"
						first={t("titleFirst")}
						second={t("titleSecond")}
						intro={t("intro")}
					/>
				</FadeIn>
				<FadeIn>
					<ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{usageItems.map((item) => (
							<UsageCard key={item.id} id={item.id} kind={item.kind} />
						))}
					</ul>
				</FadeIn>
			</div>
		</section>
	);
}
