import { spawn } from "node:child_process";
import {
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	stat,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
	COURSE_VIDEOS_BUCKET,
	VIDEO_QUALITIES,
	moduleAssetKeys,
	videoObjectPath,
} from "../../app/[locale]/(website)/academy/_helpers";
import {
	ffmpegArgs,
	matchModuleFiles,
	parseCliArgs,
	selectModules,
	srtToVtt,
} from "./_helpers";

const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH ?? "ffprobe";

function run(command: string, args: string[]) {
	return new Promise<string>((resolve, reject) => {
		const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", reject);
		child.on("close", (code) =>
			code === 0
				? resolve(stdout)
				: reject(
						new Error(`${command} exited ${code}\n${stderr.slice(-2000)}`),
					),
		);
	});
}

async function durationSeconds(file: string) {
	const output = await run(FFPROBE, [
		"-v",
		"error",
		"-show_entries",
		"format=duration",
		"-of",
		"default=nw=1:nk=1",
		file,
	]);
	return Number(output.trim());
}

function megabytes(bytes: number) {
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function openBucket() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		console.error(
			"NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
		);
		process.exit(1);
	}
	console.log(`Target: ${new URL(url).host} bucket ${COURSE_VIDEOS_BUCKET}`);
	return createClient(url, key, {
		auth: { persistSession: false },
	}).storage.from(COURSE_VIDEOS_BUCKET);
}

async function main() {
	const parsed = parseCliArgs(process.argv.slice(2));
	if (!parsed.success) {
		console.error(
			"Usage: bun course:videos <videos-dir> --course <uid> [--modules 1,2] [--dry-run]",
		);
		console.error(
			parsed.error.issues
				.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
				.join("\n"),
		);
		process.exit(1);
	}
	const { directory, course, modules: wanted, dryRun } = parsed.data;

	const modules = selectModules(
		matchModuleFiles(await readdir(directory)),
		wanted,
	);
	if (modules.length === 0) {
		console.error("No matching 'Module N <title>.mp4' files found.");
		process.exit(1);
	}

	const bucket = dryRun ? null : openBucket();

	const work = dryRun ? null : await mkdtemp(join(tmpdir(), "course-videos-"));
	if (work) console.log(`Working folder: ${work}`);

	for (const item of modules) {
		const { assetKey, captionsKey } = moduleAssetKeys(course, item.module);
		const source = join(directory, item.video);
		const targets = [
			...VIDEO_QUALITIES.map((quality) => videoObjectPath(assetKey, quality)),
			...(item.captions ? [captionsKey] : []),
		];
		console.log(`\nModule ${item.module}: ${item.title}`);

		if (dryRun || !work || !bucket) {
			for (const target of targets) {
				console.log(`  would upload ${COURSE_VIDEOS_BUCKET}/${target}`);
			}
			if (!item.captions) console.log("  no .srt found, captions skipped");
			continue;
		}

		console.log(
			`  duration_seconds: ${Math.round(await durationSeconds(source))}`,
		);
		const folder = join(work, `m${item.module}`);
		await mkdir(folder, { recursive: true });

		for (const quality of VIDEO_QUALITIES) {
			const output = join(folder, `${quality}.mp4`);
			await run(FFMPEG, ffmpegArgs(source, output, quality));
			const body = await readFile(output);
			const { error } = await bucket.upload(
				videoObjectPath(assetKey, quality),
				body,
				{
					contentType: "video/mp4",
					upsert: true,
				},
			);
			if (error) throw new Error(`Upload ${quality}p failed: ${error.message}`);
			console.log(
				`  ${quality}p ${megabytes((await stat(output)).size)} uploaded`,
			);
		}

		if (item.captions) {
			const vtt = srtToVtt(
				await readFile(join(directory, item.captions), "utf8"),
			);
			await writeFile(join(folder, "captions.vtt"), vtt);
			const { error } = await bucket.upload(
				captionsKey,
				new Blob([vtt], { type: "text/vtt" }),
				{
					contentType: "text/vtt",
					upsert: true,
				},
			);
			if (error) throw new Error(`Upload captions failed: ${error.message}`);
			console.log(`  captions uploaded (${captionsKey})`);
		} else {
			console.log("  no .srt found, captions skipped");
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
