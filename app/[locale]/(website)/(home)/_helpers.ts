export function firstName(fullName: string) {
	return fullName.trim().split(/\s+/)[0] ?? "";
}

export function mentorCreditName({
	name,
	nickname,
}: { name: string; nickname: string | null }) {
	const preferred = nickname?.trim();
	return preferred ? `${preferred} (${name})` : name;
}
