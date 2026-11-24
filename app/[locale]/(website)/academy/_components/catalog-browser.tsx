"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/src/lib/analytics";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { type ReactNode, useState } from "react";
import { type Academy, academies, academyType } from "../_schema";
import { WaitlistModal } from "./waitlist-modal";

type Filter = "all" | Academy;

export type CatalogItem = { uid: string; track: Academy; card: ReactNode };

const FILTERS: readonly Filter[] = ["all", ...academyType.options];

const trackParam = parseAsStringLiteral(FILTERS)
	.withDefault("all")
	.withOptions({ history: "replace", scroll: false });

const COMING_SOON_SURFACE: Record<Academy, string> = {
	tech: "bg-surface-indigo",
	business: "bg-surface-pink",
	climate: "bg-surface-teal",
};

function visibleItems(items: CatalogItem[], filter: Filter) {
	return filter === "all"
		? items
		: items.filter((item) => item.track === filter);
}

function layoutClass(shownCount: number) {
	return shownCount > 0
		? "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start"
		: "grid gap-6";
}

function tracksWithoutCourse(items: CatalogItem[], filter: Filter) {
	const covered = new Set(items.map((item) => item.track));
	return academyType.options.filter(
		(track) => !covered.has(track) && (filter === "all" || filter === track),
	);
}

export function CatalogBrowser({ items }: { items: CatalogItem[] }) {
	const t = useTranslations("academy.catalog");
	const [filter, setFilter] = useQueryState("track", trackParam);
	const [waitlist, setWaitlist] = useState<{ open: boolean; track: Academy }>({
		open: false,
		track: "tech",
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
		<div className="mt-8 flex flex-col gap-8">
			<fieldset className="flex min-w-0 flex-wrap gap-2 border-0 p-0">
				<legend className="sr-only">{t("filterLabel")}</legend>
				{FILTERS.map((option) => (
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
					onJoin={() => openWaitlist("tech")}
				/>
				<ul
					className={
						shown.length > 0
							? "flex flex-col gap-4"
							: "grid gap-4 lg:grid-cols-3"
					}
				>
					{waiting.map((track) => (
						<li key={track}>
							<ComingSoon track={track} onNotify={() => openWaitlist(track)} />
						</li>
					))}
				</ul>
			</div>

			<WaitlistModal
				open={waitlist.open}
				onOpenChange={(open) =>
					setWaitlist((current) => ({ ...current, open }))
				}
				academy={waitlist.track}
			/>
		</div>
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
		? "border-secondary-500 bg-secondary-500 text-white"
		: "border-border bg-white text-foreground hover:border-primary-500";
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={onPress}
			className={`min-h-11 cursor-pointer rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${tone}`}
		>
			{label}
		</button>
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
		<ul className="flex flex-col gap-6" aria-label={t("coursesLabel")}>
			{items.map((item) => (
				<li key={item.uid}>{item.card}</li>
			))}
		</ul>
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
