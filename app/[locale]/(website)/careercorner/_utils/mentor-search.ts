export const MENTOR_PAGE_SIZE = 12;
export const MENTOR_SEARCH_MAX_LENGTH = 100;
export const MENTOR_MAX_PAGE = 1000;

export function parseMentorPage(value: unknown) {
	const page = Number(value);
	if (!Number.isSafeInteger(page) || page < 1) return 1;
	return Math.min(page, MENTOR_MAX_PAGE);
}

export function toPrefixTsQuery(query: string) {
	const tokens =
		query
			.slice(0, MENTOR_SEARCH_MAX_LENGTH)
			.toLowerCase()
			.match(/[\p{L}\p{N}]+/gu) ?? [];
	return tokens.map((token) => `${token}:*`).join(" & ");
}
