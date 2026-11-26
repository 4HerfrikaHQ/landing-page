const COUNT_PATTERN = /^(\d[\d,]*)(.*)$/;

export function parseCount(value: string) {
	const match = COUNT_PATTERN.exec(value);
	if (!match) {
		return { digits: value, suffix: "", target: null, grouped: false };
	}
	const [, digits, suffix] = match;
	const target = Number(digits.replaceAll(",", ""));
	return {
		digits,
		suffix,
		target: Number.isNaN(target) ? null : target,
		grouped: digits.includes(","),
	};
}

export function formatCount(n: number, grouped: boolean) {
	return grouped ? n.toLocaleString("en-US") : String(n);
}
