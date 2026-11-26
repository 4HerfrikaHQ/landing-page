"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { EASE_OUT } from "@/components/motion/tokens";
import { Button } from "@/components/ui/button";
import { LayoutMotion } from "@/components/ui/layout-motion";
import { SelectedHighlight } from "@/components/ui/selected-highlight";
import { SiteImage as Image } from "@/components/ui/site-image";
import { trackEvent } from "@/src/lib/analytics";
import { AnimatePresence, m } from "motion/react";
import { useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { type ReactNode, useState } from "react";
import {
	type Academy,
	type CatalogFilter,
	academies,
	academyType,
	catalogFilter,
} from "../_schema";
import { WaitlistModal } from "./waitlist-modal";

export type CatalogItem = { uid: string; track: Academy; card: ReactNode };

const ALL_TRACKS = catalogFilter.def.entries.all;
const DEFAULT_WAITLIST_TRACK = academyType.def.entries.tech;

const CHIP_RADIUS = 9999;

const COURSE_SCALE = 0.98;

const COURSE_TRANSITION = { duration: 0.2, ease: EASE_OUT };

const trackParam = parseAsStringLiteral(catalogFilter.options)
	.withDefault(ALL_TRACKS)
	.withOptions({ history: "replace", scroll: false });

const COMING_SOON_SURFACE: Record<Academy, string> = {
	tech: "bg-surface-indigo",
	business: "bg-surface-pink",
	climate: "bg-surface-teal",
};

function visibleItems(items: CatalogItem[], filter: CatalogFilter) {
	return filter === ALL_TRACKS
		? items
		: items.filter((item) => item.track === filter);
}

function layoutClass(shownCount: number) {
	return shownCount > 0
		? "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start"
		: "grid gap-6";
}

function waitingListClass(shownCount: number) {
	return shownCount > 0 ? "flex flex-col gap-4" : "grid gap-4 lg:grid-cols-3";
}

function tracksWithoutCourse(items: CatalogItem[], filter: CatalogFilter) {
	const covered = new Set(items.map((item) => item.track));
	return academyType.options.filter(
		(track) =>
			!covered.has(track) && (filter === ALL_TRACKS || filter === track),
	);
}

export function CatalogBrowser({ items }: { items: CatalogItem[] }) {
	const t = useTranslations("academy.catalog");
	const [filter, setFilter] = useQueryState("track", trackParam);
	const [waitlist, setWaitlist] = useState<{ open: boolean; track: Academy }>({
		open: false,
		track: DEFAULT_WAITLIST_TRACK,
	});
	const shown = visibleItems(items, filter);
	const waiting = tracksWithoutCourse(items, filter);

	const openWaitlist = (track: Academy) => {
		trackEvent("academy_waitlist_opened", {
			academy_type: track,
			source: "academy_card",
		});
		setWaitlist({ open: true, track });
	};

	return (
		<LayoutMotion>
			<div className="mt-8 flex flex-col gap-8">
				<fieldset className="flex min-w-0 flex-wrap gap-2 border-0 p-0">
					<legend className="sr-only">{t("filterLabel")}</legend>
					{catalogFilter.options.map((option) => (
						<FilterChip
							key={option}
							label={t(`tracks.${option}`)}
							pressed={filter === option}
							onPress={() => setFilter(option)}
						/>
					))}
				</fieldset>

				<div className={layoutClass(shown.length)}>
					<CourseColumn
						items={shown}
						empty={items.length === 0}
						onJoin={() => openWaitlist(DEFAULT_WAITLIST_TRACK)}
					/>
					<RevealGroup as="ul" className={waitingListClass(shown.length)}>
						{waiting.map((track) => (
							<li key={track}>
								<ComingSoon
									track={track}
									onNotify={() => openWaitlist(track)}
								/>
							</li>
						))}
					</RevealGroup>
				</div>

				<WaitlistModal
					open={waitlist.open}
					onOpenChange={(open) =>
						setWaitlist((current) => ({ ...current, open }))
					}
					academy={waitlist.track}
				/>
			</div>
		</LayoutMotion>
	);
}

function FilterChip({
	label,
	pressed,
	onPress,
}: {
	label: string;
	pressed: boolean;
	onPress: () => void;
}) {
	const tone = pressed
		? "border-transparent text-white"
		: "border-border bg-white text-foreground hover:border-primary-500";
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={onPress}
			className={`relative isolate min-h-11 cursor-pointer rounded-full border px-5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${tone}`}
		>
			<ChipHighlight pressed={pressed} />
			{label}
		</button>
	);
}

function ChipHighlight({ pressed }: { pressed: boolean }) {
	if (!pressed) return null;
	return (
		<SelectedHighlight
			layoutId="academy-track-highlight"
			radius={CHIP_RADIUS}
			className="bg-secondary-500"
		/>
	);
}

function ComingSoon({
	track,
	onNotify,
}: {
	track: Academy;
	onNotify: () => void;
}) {
	const t = useTranslations("academy.catalog");
	const academy = academies.find((item) => item.academy === track);
	const trackLabel = t(`tracks.${track}`);
	return (
		<div
			className={`flex items-center gap-4 rounded-3xl p-5 ${COMING_SOON_SURFACE[track]}`}
		>
			<div className="relative size-16 shrink-0 overflow-hidden rounded-full">
				<Image
					src={academy?.image ?? ""}
					alt=""
					fill
					sizes="64px"
					className="object-cover"
				/>
			</div>
			<div className="flex min-w-0 flex-col items-start gap-1">
				<p className="text-xs font-bold uppercase tracking-wide text-primary-700">
					{trackLabel}
				</p>
				<p className="text-base font-semibold text-secondary-500">
					{t("comingSoon")}
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onNotify}
					aria-label={t("notifyMeFor", { track: trackLabel })}
					className="min-h-11 bg-white/70"
				>
					{t("notifyMe")}
				</Button>
			</div>
		</div>
	);
}

function CourseColumn({
	items,
	empty,
	onJoin,
}: {
	items: CatalogItem[];
	empty: boolean;
	onJoin: () => void;
}) {
	const t = useTranslations("academy.catalog");
	if (empty) return <EmptyCatalog onJoin={onJoin} />;
	if (items.length === 0) return null;
	return (
		<FadeIn>
			<ul
				className="relative flex flex-col gap-6"
				aria-label={t("coursesLabel")}
			>
				<AnimatePresence mode="popLayout" initial={false}>
					{items.map((item) => (
						<m.li
							key={item.uid}
							layout="position"
							initial={{ opacity: 0, scale: COURSE_SCALE }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: COURSE_SCALE }}
							transition={COURSE_TRANSITION}
						>
							{item.card}
						</m.li>
					))}
				</AnimatePresence>
			</ul>
		</FadeIn>
	);
}

function EmptyCatalog({ onJoin }: { onJoin: () => void }) {
	const t = useTranslations("academy.catalog");
	return (
		<div className="flex flex-col items-start gap-3 rounded-3xl bg-surface-pink p-6 sm:p-8">
			<h3 className="text-2xl font-semibold text-secondary-500">
				{t("emptyTitle")}
			</h3>
			<p className="max-w-lg text-base leading-6 text-muted-foreground">
				{t("emptyBody")}
			</p>
			<Button
				type="button"
				size="lg"
				onClick={onJoin}
				className="min-h-12 text-base md:py-3 md:text-base"
			>
				{t("emptyAction")}
			</Button>
		</div>
	);
}
