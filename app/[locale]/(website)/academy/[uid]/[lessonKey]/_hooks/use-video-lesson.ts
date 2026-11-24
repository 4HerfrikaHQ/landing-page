"use client";

import type { MediaPlayerInstance } from "@vidstack/react";
import { type RefObject, useReducer, useRef } from "react";
import { canCompleteVideo, clampVideoSeek } from "../../../_helpers";
import type { VideoQuality } from "../../../_helpers";
import type { CompletionPolicy } from "../../../_schema";
import { refreshVideoSources, reportVideoProgress } from "../_actions/progress";
import { PROGRESS_INTERVAL_MS } from "../_helpers";

export type VideoSources = {
	sources: { src: string; quality: VideoQuality }[];
	captions: string | null;
	expiresAtMs: number;
};

type SourceState =
	| ({ kind: "ready" } & VideoSources)
	| { kind: "refreshing" }
	| { kind: "failed" };

type State = {
	source: SourceState;
	quality: VideoQuality;
	furthest: number;
};

type Event =
	| { type: "refreshing" }
	| { type: "refreshed"; sources: VideoSources }
	| { type: "failed" }
	| { type: "quality"; quality: VideoQuality }
	| { type: "furthest"; seconds: number };

const DEFAULT_QUALITY: VideoQuality = 480;
const NATURAL_STEP_SECONDS = 3;
const REFRESH_MARGIN_MS = 60_000;

function reducer(state: State, event: Event): State {
	switch (event.type) {
		case "refreshing":
			return { ...state, source: { kind: "refreshing" } };
		case "refreshed":
			return { ...state, source: { kind: "ready", ...event.sources } };
		case "failed":
			return { ...state, source: { kind: "failed" } };
		case "quality":
			return { ...state, quality: event.quality };
		case "furthest":
			return { ...state, furthest: Math.max(state.furthest, event.seconds) };
	}
}

type Input = {
	uid: string;
	lessonKey: string;
	policy: CompletionPolicy;
	durationSeconds: number | null;
	completed: boolean;
	furthestSeconds: number;
	startSeconds: number;
	initial: VideoSources;
	player: RefObject<MediaPlayerInstance | null>;
};

export function useVideoLesson(input: Input) {
	const { uid, lessonKey, policy, completed, player } = input;
	const [state, dispatch] = useReducer(reducer, {
		source: { kind: "ready", ...input.initial },
		quality: DEFAULT_QUALITY,
		furthest: input.furthestSeconds,
	});
	const allowed = useRef(input.furthestSeconds);
	const lastSentAt = useRef(0);
	const resumeAt = useRef<number | null>(input.startSeconds);

	async function send(position: number) {
		lastSentAt.current = Date.now();
		const result = await reportVideoProgress({
			uid,
			lessonKey,
			positionSeconds: position,
		});
		const furthest = result?.data?.furthestSeconds;
		if (furthest === undefined) return;
		dispatch({ type: "furthest", seconds: furthest });
	}

	function flush() {
		const current = player.current?.currentTime;
		if (current === undefined || !Number.isFinite(current)) return;
		void send(current);
	}

	function onTimeUpdate(detail: { currentTime: number }) {
		const time = detail.currentTime;
		if (time <= allowed.current + NATURAL_STEP_SECONDS) {
			allowed.current = Math.max(allowed.current, time);
		}
		if (Date.now() - lastSentAt.current >= PROGRESS_INTERVAL_MS)
			void send(time);
	}

	function onSeeking(time: number) {
		const limit = Math.max(allowed.current, state.furthest);
		const target = clampVideoSeek(policy, limit, time, completed);
		if (target >= time || !player.current) return;
		player.current.currentTime = target;
	}

	function showCaptions() {
		const tracks = player.current?.textTracks;
		if (!tracks) return;
		for (const track of tracks) {
			if (track.kind === "subtitles" || track.kind === "captions") {
				track.mode = "showing";
			}
		}
	}

	function onCanPlay() {
		showCaptions();
		const start = resumeAt.current;
		if (start === null || !player.current) return;
		resumeAt.current = null;
		if (start > 0) player.current.currentTime = start;
	}

	async function reload() {
		const position = player.current?.currentTime ?? 0;
		resumeAt.current = position;
		dispatch({ type: "refreshing" });
		const result = await refreshVideoSources({ uid, lessonKey });
		if (!result?.data) {
			dispatch({ type: "failed" });
			return;
		}
		dispatch({ type: "refreshed", sources: result.data });
	}

	function onError() {
		const source = state.source;
		if (source.kind !== "ready") return;
		if (Date.now() < source.expiresAtMs - REFRESH_MARGIN_MS) {
			dispatch({ type: "failed" });
			return;
		}
		void reload();
	}

	function setQuality(quality: VideoQuality) {
		resumeAt.current = player.current?.currentTime ?? 0;
		dispatch({ type: "quality", quality });
	}

	return {
		state,
		canContinue:
			completed ||
			canCompleteVideo(policy, state.furthest, input.durationSeconds ?? 0),
		flush,
		onTimeUpdate,
		onSeeking,
		onCanPlay,
		onError,
		reload,
		setQuality,
	};
}
