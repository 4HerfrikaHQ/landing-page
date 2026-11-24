import { describe, expect, test } from "bun:test";
import {
	ffmpegArgs,
	matchModuleFiles,
	parseCliArgs,
	selectModules,
	srtToVtt,
} from "./_helpers";

describe("matchModuleFiles", () => {
	const names = [
		"Module 2 From opportunity to application.mp4",
		"Module 2 From opportunity to application.srt",
		"Module 1 Meet your AI study partner.mp4",
		"Module 1 Meet your AI study partner.srt",
		"Module 10 Last one.mp4",
		"notes.txt",
		".DS_Store",
	];

	test("pairs videos with same-named srt and sorts numerically", () => {
		expect(matchModuleFiles(names).map((item) => item.module)).toEqual([
			1, 2, 10,
		]);
		expect(matchModuleFiles(names)[0]).toEqual({
			module: 1,
			title: "Meet your AI study partner",
			video: "Module 1 Meet your AI study partner.mp4",
			captions: "Module 1 Meet your AI study partner.srt",
		});
	});

	test("reports missing captions as null", () => {
		expect(matchModuleFiles(names)[2].captions).toBeNull();
	});

	test("selectModules filters by number", () => {
		expect(
			selectModules(matchModuleFiles(names), [2]).map((item) => item.module),
		).toEqual([2]);
		expect(selectModules(matchModuleFiles(names), undefined)).toHaveLength(3);
	});
});

describe("srtToVtt", () => {
	const srt =
		"﻿1\r\n00:00:00,000 --> 00:00:02,500\r\nHello, world\r\n\r\n2\r\n00:00:02,500 --> 00:00:05,1\r\n42\r\nSecond line\r\n";

	test("adds header, converts timestamps and drops cue indices", () => {
		expect(srtToVtt(srt)).toBe(
			"WEBVTT\n\n00:00:00.000 --> 00:00:02.500\nHello, world\n\n00:00:02.500 --> 00:00:05.100\n42\nSecond line\n",
		);
	});

	test("keeps commas in cue text", () => {
		expect(srtToVtt(srt)).toContain("Hello, world");
	});
});

describe("ffmpegArgs", () => {
	test("caps height, keeps aspect ratio and enables faststart", () => {
		const args = ffmpegArgs("in.mp4", "out.mp4", 480);
		expect(args).toContain("scale=-2:'min(480,ih)'");
		expect(args).toContain("+faststart");
		expect(args.at(-1)).toBe("out.mp4");
	});
});

describe("parseCliArgs", () => {
	test("parses directory, course, modules and dry run", () => {
		const parsed = parseCliArgs([
			"dir",
			"--course",
			"abc",
			"--modules",
			"1,2",
			"--dry-run",
		]);
		expect(parsed.success && parsed.data).toEqual({
			directory: "dir",
			course: "abc",
			modules: [1, 2],
			dryRun: true,
		});
	});

	test("rejects missing course and bad modules", () => {
		expect(parseCliArgs(["dir"]).success).toBe(false);
		expect(
			parseCliArgs(["dir", "--course", "a", "--modules", "x"]).success,
		).toBe(false);
	});
});
