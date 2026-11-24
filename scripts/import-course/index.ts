import * as prismic from "@prismicio/client";
import config from "../../slicemachine.config.json";
import {
	type PlannedDocument,
	courseDocument,
	lessonDocuments,
	partnerDocuments,
} from "./_build";
import { CourseManifest } from "./_schema";

const LANG = "en-us";

function identityOf(document: prismic.PrismicDocument): string | undefined {
	const lessonKey = (document.data as { lesson_key?: unknown }).lesson_key;
	return typeof lessonKey === "string"
		? lessonKey
		: (document.uid ?? undefined);
}

async function readManifest(path: string | undefined) {
	if (!path) {
		throw new Error(
			"Usage: bun course:import <path/to/course.json> [--dry-run]",
		);
	}
	const parsed = CourseManifest.safeParse(await Bun.file(path).json());
	if (!parsed.success) {
		throw new Error(
			`The manifest is not valid:\n${formatIssues(parsed.error)}`,
		);
	}
	return parsed.data;
}

function formatIssues(error: {
	issues: { path: PropertyKey[]; message: string }[];
}) {
	return error.issues
		.map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
		.join("\n");
}

async function existingDocuments(
	client: prismic.WriteClient,
	courseTag: string,
) {
	const releases = await client.getReleases();
	const refs = [undefined, ...releases.map((release) => release.ref)];
	const byKey = new Map<string, prismic.PrismicDocument>();
	for (const ref of refs) {
		for (const type of [
			"partner",
			"course",
			"video_lesson",
			"reading",
			"quiz",
			"task",
		]) {
			const documents = await client.getAllByType(type, { ref, lang: LANG });
			for (const document of documents) {
				const identity = identityOf(document);
				const isLesson = type !== "partner" && type !== "course";
				if (isLesson && !document.tags.includes(courseTag)) continue;
				if (identity) byKey.set(`${type}:${identity}`, document);
			}
		}
	}
	return byKey;
}

function plan(
	manifest: CourseManifest,
	linkTo: Parameters<typeof courseDocument>[1],
) {
	return [
		...partnerDocuments(manifest),
		...lessonDocuments(manifest),
		courseDocument(manifest, linkTo),
	];
}

async function main() {
	const [path, ...flags] = process.argv.slice(2);
	const dryRun = flags.includes("--dry-run");
	const manifest = await readManifest(path);

	if (dryRun) {
		const documents = plan(manifest, (type, identity) => `${type}:${identity}`);
		for (const document of documents) {
			console.log(
				`${document.type.padEnd(12)} ${document.identity}  ${document.title}`,
			);
		}
		console.log(
			`\n${documents.length} documents would be written as drafts. Nothing was sent.`,
		);
		return;
	}

	const writeToken = process.env.PRISMIC_WRITE_TOKEN;
	const accessToken = process.env.PRISMIC_ACCESS_TOKEN;
	if (!writeToken) {
		throw new Error("Set PRISMIC_WRITE_TOKEN in .env.");
	}

	const client = prismic.createWriteClient(config.repositoryName, {
		writeToken,
		accessToken,
	});
	const courseTag = `course:${manifest.course.uid}`;
	const existing = await existingDocuments(client, courseTag);
	const migration = prismic.createMigration();
	const registered = new Map<string, prismic.PrismicMigrationDocument>();

	const register = (document: PlannedDocument) => {
		const key = `${document.type}:${document.identity}`;
		const found = existing.get(key);
		const entry = found
			? migration.updateDocument(
					{ ...found, data: { ...found.data, ...document.data } } as never,
					document.title,
				)
			: migration.createDocument(
					{
						type: document.type,
						uid: document.uid,
						lang: LANG,
						tags: ["academy", courseTag],
						data: document.data,
					} as never,
					document.title,
				);
		registered.set(key, entry);
		console.log(`${found ? "update" : "create"}  ${key}`);
	};

	const linkTo = (type: PlannedDocument["type"], identity: string) => () => {
		const target = registered.get(`${type}:${identity}`);
		if (!target) throw new Error(`Nothing to link for ${type}:${identity}`);
		return target;
	};

	for (const document of plan(manifest, linkTo)) register(document);

	await client.migrate(migration, {
		reporter: (event) => {
			if (event.type === "end")
				console.log(
					"\nDone. Review the drafts in Prismic's Migration release, then publish them before running this again: unpublished drafts can't be found, so a second run before publishing creates duplicates.",
				);
		},
	});
}

await main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
