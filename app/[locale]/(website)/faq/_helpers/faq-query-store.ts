let query = "";
const listeners = new Set<() => void>();

export function subscribeToFaqQuery(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function getFaqQuery() {
	return query;
}

export function getServerFaqQuery() {
	return "";
}

export function setFaqQuery(next: string) {
	query = next;
	for (const listener of listeners) listener();
}
