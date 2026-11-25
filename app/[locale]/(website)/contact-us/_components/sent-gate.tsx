"use client";

import { type ReactNode, useEffect } from "react";
import { resetContactSession } from "../_lib/contact-session";
import { useContactSession } from "../_lib/use-contact-session";
import { ContactSuccess } from "./contact-success";

export function SentGate({ children }: { children: ReactNode }) {
	const { sent } = useContactSession();

	useEffect(() => resetContactSession, []);

	if (sent) return <ContactSuccess sent={sent} />;
	return children;
}
