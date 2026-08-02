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
	const term = query.trim().toLowerCase();

	return mentors.filter((mentor) => {
		if (onlyAvailable && (mentor.availability?.length ?? 0) === 0) {
			return false;
		}
		if (!term) return true;

		const haystack =
			`${mentor.nickname ?? ""} ${mentor.name} ${mentor.position ?? ""}`.toLowerCase();
		return haystack.includes(term);
	});
}
