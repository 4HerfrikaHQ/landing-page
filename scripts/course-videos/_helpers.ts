import { z } from "zod";

const MODULE_VIDEO = /^Module\s+(\d+)\s+(.+)\.mp4$/i;

export type ModuleFiles = {
	module: number;
	title: string;
	video: string;
	captions: string | null;
};

export function matchModuleFiles(filenames: string[]): ModuleFiles[] {
	const files = new Set(filenames);
	return filenames
		.flatMap((video) => {
			const match = MODULE_VIDEO.exec(video);
			if (!match) return [];
			const captions = video.replace(/\.mp4$/i, ".srt");
			return [
				{
					module: Number(match[1]),
					title: match[2].trim(),
					video,
					captions: files.has(captions) ? captions : null,
				},
			];
		})
		.sort((a, b) => a.module - b.module);
}

export function selectModules(
	modules: ModuleFiles[],
	wanted: number[] | undefined,
) {
	return wanted
		? modules.filter((item) => wanted.includes(item.module))
		: modules;
}

const CUE_TIMING =
	/^(\d{1,2}:\d{2}:\d{2}),(\d{1,3})(\s+-->\s+)(\d{1,2}:\d{2}:\d{2}),(\d{1,3})/;

export function srtToVtt(srt: string): string {
	const lines = srt.replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim().split("\n");
	const out: string[] = ["WEBVTT", ""];
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const next = lines[index + 1] ?? "";
		const isIndex = /^\d+$/.test(line.trim()) && CUE_TIMING.test(next);
		if (isIndex) continue;
		out.push(
			line.replace(
				CUE_TIMING,
				(_, start, startMs, arrow, end, endMs) =>
					`${start}.${startMs.padEnd(3, "0")}${arrow}${end}.${endMs.padEnd(3, "0")}`,
			),
		);
	}
	return `${out.join("\n")}\n`;
}

export function ffmpegArgs(input: string, output: string, height: number) {
	return [
		"-y",
		"-i",
		input,
		"-vf",
		`scale=-2:'min(${height},ih)'`,
		"-c:v",
		"libx264",
		"-preset",
		"slow",
		"-crf",
		height <= 480 ? "26" : "24",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		"-b:a",
		height <= 480 ? "96k" : "128k",
		"-movflags",
		"+faststart",
		output,
	];
}

export const CliArgs = z.object({
	directory: z.string().min(1),
	course: z.string().regex(/^[a-z0-9-]+$/),
	modules: z
		.string()
		.optional()
		.transform((value) =>
			value ? value.split(",").map((part) => Number(part.trim())) : undefined,
		)
		.pipe(z.array(z.number().int().positive()).optional()),
	dryRun: z.boolean(),
});
export type CliArgs = z.infer<typeof CliArgs>;

export function parseCliArgs(argv: string[]) {
	const positional: string[] = [];
	const flags: Record<string, string | true> = {};
	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === "--dry-run") flags.dryRun = true;
		else if (arg === "--course") flags.course = argv[++index];
		else if (arg === "--modules") flags.modules = argv[++index];
		else positional.push(arg);
	}
	return CliArgs.safeParse({
		directory: positional[0],
		course: flags.course,
		modules: flags.modules,
		dryRun: flags.dryRun === true,
	});
}
