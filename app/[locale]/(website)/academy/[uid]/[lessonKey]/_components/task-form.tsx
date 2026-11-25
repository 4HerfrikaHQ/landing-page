"use client";

import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { type ReactNode, useReducer } from "react";
import { submitTask } from "../_actions/task";
import { MAX_TASK_TEXT_LENGTH, MIN_TASK_TEXT_LENGTH } from "../_schema";
import { ActionErrorText } from "./action-error-text";
import { PRIMARY_ACTION } from "./lesson-footer";

type Track = { key: string; title: string; instructions: ReactNode };

type Props = {
	uid: string;
	lessonKey: string;
	resubmit: boolean;
	intro: ReactNode;
	tracks: Track[];
};

type Draft = { track: string | null; body: string };
type Event = { type: "track"; key: string } | { type: "body"; value: string };

function reducer(state: Draft, event: Event): Draft {
	if (event.type === "track") return { ...state, track: event.key };
	return { ...state, body: event.value };
}

export function TaskForm({ uid, lessonKey, resubmit, intro, tracks }: Props) {
	const t = useTranslations("academy.lesson.task");
	const router = useRouter();
	const [draft, dispatch] = useReducer(reducer, {
		track: tracks.length === 1 ? tracks[0].key : null,
		body: "",
	});
	const action = useAction(submitTask, { onSuccess: () => router.refresh() });
	const busy = action.isPending || action.hasSucceeded;
	const needsTrack = tracks.length > 0 && draft.track === null;
	const charactersToGo = Math.max(
		0,
		MIN_TASK_TEXT_LENGTH - draft.body.trim().length,
	);
	const tooShort = charactersToGo > 0;
	const active = tracks.find((track) => track.key === draft.track);

	return (
		<form
			className="flex flex-col gap-5"
			onSubmit={(event) => {
				event.preventDefault();
				if (busy || needsTrack || tooShort) return;
				action.execute({
					uid,
					lessonKey,
					track: draft.track ?? undefined,
					body: draft.body,
				});
			}}
		>
			<TrackPicker
				tracks={tracks}
				value={draft.track}
				onChange={(key) => dispatch({ type: "track", key })}
			/>
			<div className="flex flex-col gap-4">
				{active ? active.instructions : intro}
			</div>
			<p className="rounded-2xl bg-[#fff1c2] p-4 text-base text-secondary-500">
				{t("privacy")}
			</p>
			<div className="flex flex-col gap-2">
				<label
					htmlFor="task-body"
					className="text-base font-semibold text-secondary-500"
				>
					{t("yourWork")}
				</label>
				<textarea
					id="task-body"
					value={draft.body}
					maxLength={MAX_TASK_TEXT_LENGTH}
					rows={8}
					placeholder={t("placeholder")}
					onChange={(event) =>
						dispatch({ type: "body", value: event.target.value })
					}
					className="w-full rounded-2xl border border-border p-4 text-base text-secondary-500 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-500"
				/>
				<p className="flex justify-between text-sm text-muted-foreground">
					<span>{t("fileSoon")}</span>
					<span className="tabular-nums">
						{t("count", {
							count: draft.body.length,
							max: MAX_TASK_TEXT_LENGTH,
						})}
					</span>
				</p>
			</div>
			<button
				type="submit"
				disabled={busy || needsTrack || tooShort}
				className={`${PRIMARY_ACTION} lg:self-start`}
			>
				{busy ? t("submitting") : resubmit ? t("resubmit") : t("submit")}
			</button>
			<TooShortHint charactersToGo={charactersToGo} />
			<p className="text-sm text-muted-foreground">{t("reply")}</p>
			<ActionErrorText code={action.result.serverError} />
		</form>
	);
}

function TooShortHint({ charactersToGo }: { charactersToGo: number }) {
	const t = useTranslations("academy.lesson.task");
	if (charactersToGo === 0) return null;
	return (
		<p className="text-sm text-muted-foreground">
			{t("tooShort", { min: MIN_TASK_TEXT_LENGTH, remaining: charactersToGo })}
		</p>
	);
}

function TrackPicker({
	tracks,
	value,
	onChange,
}: {
	tracks: Track[];
	value: string | null;
	onChange: (key: string) => void;
}) {
	const t = useTranslations("academy.lesson.task");
	if (tracks.length < 2) return null;
	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="mb-2 text-xl font-semibold text-secondary-500">
				{t("chooseTrack")}
			</legend>
			<div className="grid gap-3 sm:grid-cols-2">
				{tracks.map((track) => (
					<label key={track.key} className="relative block cursor-pointer">
						<input
							type="radio"
							name="track"
							value={track.key}
							checked={value === track.key}
							onChange={() => onChange(track.key)}
							className="peer sr-only"
						/>
						<span className="flex min-h-16 flex-col justify-center rounded-2xl border border-border bg-white px-4 py-3 text-secondary-500 peer-checked:border-2 peer-checked:border-primary-500 peer-checked:bg-surface-pink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500">
							<span className="text-sm text-muted-foreground">
								{t("trackLabel", { key: track.key })}
							</span>
							<span className="text-base font-semibold">{track.title}</span>
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
