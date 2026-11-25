"use client";

import { useSyncExternalStore } from "react";
import {
	getContactSession,
	getServerContactSession,
	subscribeToContactSession,
} from "./contact-session";

export function useContactSession() {
	return useSyncExternalStore(
		subscribeToContactSession,
		getContactSession,
		getServerContactSession,
	);
}
