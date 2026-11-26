"use client";

import {
	MediaPlayer,
	type MediaPlayerInstance,
	MediaProvider,
	Poster,
	SeekButton,
	Track,
} from "@vidstack/react";
import {
	DefaultVideoLayout,
	defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import type { VideoQuality } from "../../../_helpers";
import { VIDEO_QUALITIES } from "../../../_helpers";
import type { CompletionPolicy } from "../../../_schema";
import { type VideoSources, useVideoLesson } from "../_hooks/use-video-lesson";
import { CompleteButton } from "./complete-button";
import { LessonFooter, PRIMARY_ACTION } from "./lesson-footer";
import { LessonHeading } from "./lesson-heading";

type Props = {
	uid: string;
	lessonKey: string;
	title: string;
	policy: CompletionPolicy;
	durationSeconds: number | null;
	completed: boolean;
	furthestSeconds: number;
	startSeconds: number;
	posterUrl: string | null;
	initial: VideoSources;
	previousHref: string | null;
	nextHref: string | null;
	courseHref: string;
	transcript: ReactNode;
};

const REWIND_SECONDS = 10;

const QUALITY_LABEL: Record<VideoQuality, "q480" | "q720"> = {
	480: "q480",
	720: "q720",
};

export function VideoPlayer(props: Props) {
	const player = useRef<MediaPlayerInstance>(null);
	const video = useVideoLesson({ ...props, player });
	const latestFlush = useRef(video.flush);
	latestFlush.current = video.flush;

	useEffect(() => {
		const flush = () => latestFlush.current();
		window.addEventListener("pagehide", flush);
		return () => {
			window.removeEventListener("pagehide", flush);
			flush();
		};
	}, []);

	return (
		<>
			<PlayerArea props={props} video={video} player={player} />
			<LessonHeading title={props.title} />
			<QualityPicker
				quality={video.state.quality}
				onChange={video.setQuality}
			/>
			<FirstWatchNote
				enforced={props.policy.videoMustFinish && !props.completed}
			/>
			<Transcript transcript={props.transcript} />
			<LessonFooter previousHref={props.previousHref}>
				<CompleteButton
					uid={props.uid}
					lessonKey={props.lessonKey}
					label="continue"
					completed={props.completed}
					enabled={video.canContinue}
					nextHref={props.nextHref}
					courseHref={props.courseHref}
				/>
			</LessonFooter>
		</>
	);
}

type VideoApi = ReturnType<typeof useVideoLesson>;

function PlayerArea({
	props,
	video,
	player,
}: {
	props: Props;
	video: VideoApi;
	player: React.RefObject<MediaPlayerInstance | null>;
}) {
	const t = useTranslations("academy.lesson");
	const { source, quality } = video.state;
	if (source.kind === "refreshing") {
		return (
			<output className="flex aspect-video items-center justify-center rounded-2xl bg-secondary-500 text-white">
				{t("video.refreshing")}
			</output>
		);
	}
	if (source.kind === "failed") {
		return (
			<div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-2xl bg-secondary-500 p-4 text-center text-white">
				<p role="alert">{t("video.failed")}</p>
				<button type="button" onClick={video.reload} className={PRIMARY_ACTION}>
					{t("video.retry")}
				</button>
			</div>
		);
	}
	const current = source.sources.find((item) => item.quality === quality);
	return (
		<MediaPlayer
			ref={player}
			title={props.title}
			src={{ src: current?.src ?? source.sources[0].src, type: "video/mp4" }}
			playsInline
			crossOrigin
			className="aspect-video w-full overflow-hidden rounded-2xl bg-secondary-500"
			onTimeUpdate={video.onTimeUpdate}
			onSeeking={video.onSeeking}
			onCanPlay={video.onCanPlay}
			onPause={video.flush}
			onEnded={video.flush}
			onError={video.onError}
		>
			<MediaProvider>
				<PosterImage url={props.posterUrl} title={props.title} />
				<CaptionTrack url={source.captions} />
			</MediaProvider>
			<DefaultVideoLayout
				icons={defaultLayoutIcons}
				seekStep={REWIND_SECONDS}
				slots={{
					largeLayout: { beforePlayButton: <RewindButton /> },
					smallLayout: { beforeFullscreenButton: <RewindButton /> },
				}}
			/>
		</MediaPlayer>
	);
}

function RewindButton() {
	const t = useTranslations("academy.lesson.video");
	return (
		<SeekButton
			seconds={-REWIND_SECONDS}
			aria-label={t("rewind", { seconds: REWIND_SECONDS })}
			className="vds-button"
		>
			<defaultLayoutIcons.SeekButton.Backward />
		</SeekButton>
	);
}

function PosterImage({ url, title }: { url: string | null; title: string }) {
	if (!url) return null;
	return (
		<Poster
			src={url}
			alt={title}
			className="absolute inset-0 block h-full w-full object-cover opacity-0 transition-opacity data-[visible]:opacity-100"
		/>
	);
}

function CaptionTrack({ url }: { url: string | null }) {
	const t = useTranslations("academy.lesson.video");
	if (!url) return null;
	return (
		<Track
			src={url}
			kind="subtitles"
			label={t("captionsLabel")}
			lang="en"
			default
		/>
	);
}

function QualityPicker({
	quality,
	onChange,
}: {
	quality: VideoQuality;
	onChange: (quality: VideoQuality) => void;
}) {
	const t = useTranslations("academy.lesson.video");
	return (
		<fieldset className="flex w-fit gap-1 rounded-full bg-surface-indigo p-1">
			<legend className="sr-only">{t("quality")}</legend>
			{VIDEO_QUALITIES.map((item) => (
				<label key={item} className="relative block cursor-pointer">
					<input
						type="radio"
						name="video-quality"
						value={item}
						checked={quality === item}
						onChange={() => onChange(item)}
						className="peer sr-only"
					/>
					<span className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-muted-foreground peer-checked:bg-white peer-checked:text-secondary-500 peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-primary-500">
						{t(QUALITY_LABEL[item])} · {item}p
					</span>
				</label>
			))}
		</fieldset>
	);
}

function FirstWatchNote({ enforced }: { enforced: boolean }) {
	const t = useTranslations("academy.lesson.video");
	if (!enforced) return null;
	return (
		<p className="flex gap-3 rounded-2xl bg-surface-indigo p-4 text-base text-secondary-500">
			<Info className="mt-0.5 size-5 shrink-0" aria-hidden />
			{t("noSkip")}
		</p>
	);
}

function Transcript({ transcript }: { transcript: ReactNode }) {
	const t = useTranslations("academy.lesson.video");
	if (!transcript) return null;
	return (
		<details className="group rounded-2xl border border-border">
			<summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 text-base font-semibold text-secondary-500 focus-visible:outline-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden">
				{t("transcript")}
				<span
					aria-hidden
					className="text-primary-700 group-open:rotate-45 motion-safe:transition-transform"
				>
					+
				</span>
			</summary>
			<div className="flex flex-col gap-3 px-4 pb-4">
				<p className="text-sm text-muted-foreground">{t("transcriptHint")}</p>
				{transcript}
			</div>
		</details>
	);
}
