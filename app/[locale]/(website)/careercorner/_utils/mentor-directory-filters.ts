type MentorFilterRecord = {
	nickname: string | null;
	name: string;
	position: string | null;
	availability?: unknown[] | null;
};

function words(value: string): string[] {
	return (
		value
			.normalize("NFD")
			.replace(/\p{M}/gu, "")
			.toLowerCase()
			.match(/[\p{L}\p{N}]+/gu) ?? []
	);
}

// Role variants share a substantial root: manage+r / manage+ment,
// develop+er / develop+ment, engineer / engineer+ing.
const roleEndings = new Set([
	"",
	"s",
	"r",
	"rs",
	"er",
	"ers",
	"ment",
	"ments",
	"ing",
]);

function matchesWord(term: string, word: string): boolean {
	if (word.includes(term)) return true;

	let shared = 0;
	while (
		shared < Math.min(term.length, word.length) &&
		term[shared] === word[shared]
	) {
		shared++;
	}
	for (let root = shared; root >= 5; root--) {
		if (
			roleEndings.has(term.slice(root)) &&
			roleEndings.has(word.slice(root))
		) {
			return true;
		}
	}

	// Short words/initials need an exact match; longer words allow small typos.
	const allowed = term.length < 4 ? 0 : term.length < 8 ? 1 : 2;
	if (!allowed || Math.abs(term.length - word.length) > allowed) return false;

	const rows: number[][] = [
		Array.from({ length: word.length + 1 }, (_, i) => i),
	];
	for (let i = 1; i <= term.length; i++) {
		const row = [i];
		for (let j = 1; j <= word.length; j++) {
			row[j] = Math.min(
				row[j - 1] + 1,
				rows[i - 1][j] + 1,
				rows[i - 1][j - 1] + (term[i - 1] === word[j - 1] ? 0 : 1),
			);
			if (
				i > 1 &&
				j > 1 &&
				term[i - 1] === word[j - 2] &&
				term[i - 2] === word[j - 1]
			) {
				row[j] = Math.min(row[j], rows[i - 2][j - 2] + 1);
			}
		}
		rows.push(row);
	}
	return rows[term.length][word.length] <= allowed;
}

export function filterMentors<T extends MentorFilterRecord>(
	mentors: T[],
	query: string,
	onlyAvailable: boolean,
): T[] {
	const terms = words(query);

	return mentors.filter((mentor) => {
		if (onlyAvailable && (mentor.availability?.length ?? 0) === 0) {
			return false;
		}
		if (terms.length === 0) return true;

		const haystack = words(
			`${mentor.nickname ?? ""} ${mentor.name} ${mentor.position ?? ""}`,
		);
		return terms.every((term) =>
			haystack.some((word) => matchesWord(term, word)),
		);
	});
}
