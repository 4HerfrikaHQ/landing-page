import Fuse from "fuse.js";

type MentorFilterRecord = {
	nickname: string | null;
	name: string;
	position: string | null;
	availability?: unknown[] | null;
};

export function filterMentors<T extends MentorFilterRecord>(
	mentors: T[],
	query: string,
	onlyAvailable: boolean,
): T[] {
	const eligible = onlyAvailable
		? mentors.filter((mentor) => (mentor.availability?.length ?? 0) > 0)
		: mentors;
	if (!query.trim()) return eligible;

	return new Fuse(eligible, {
		keys: ["nickname", "name", "position"],
		useTokenSearch: true,
		tokenMatch: "all",
		ignoreDiacritics: true,
		ignoreLocation: true,
		// Four edits in "management" still match "manager". All words must match.
		threshold: 0.4,
		minMatchCharLength: 2,
		shouldSort: false,
	})
		.search(query)
		.map(({ item }) => item);
}
