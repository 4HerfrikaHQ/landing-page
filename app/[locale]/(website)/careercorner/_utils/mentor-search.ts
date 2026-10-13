export const MENTOR_PAGE_SIZE = 12;
export const MENTOR_SEARCH_MAX_LENGTH = 100;

export function toPrefixTsQuery(query: string) {
	const tokens =
		query
			.slice(0, MENTOR_SEARCH_MAX_LENGTH)
			.toLowerCase()
			.match(/[\p{L}\p{N}]+/gu) ?? [];
	return tokens.map((token) => `${token}:*`).join(" & ");
}
