import type { Topic } from "../_schema";

export type SentMessage = { topic: Topic; email: string };

type ContactSession = {
	topic: Topic | null;
	sent: SentMessage | null;
};

const INITIAL_SESSION: ContactSession = { topic: null, sent: null };

let session = INITIAL_SESSION;
const listeners = new Set<() => void>();

function update(next: Partial<ContactSession>) {
	session = { ...session, ...next };
	for (const listener of listeners) listener();
}

export function subscribeToContactSession(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export const getContactSession = () => session;
export const getServerContactSession = () => INITIAL_SESSION;
export const selectTopic = (topic: Topic | null) => update({ topic });
export const markSent = (sent: SentMessage) => update({ sent });
export const resetContactSession = () => update(INITIAL_SESSION);
