export function subscribeToHash(onChange: () => void) {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
}

export function getHash() {
	try {
		return decodeURIComponent(window.location.hash.slice(1));
	} catch {
		return "";
	}
}

export function getServerHash() {
	return "";
}
