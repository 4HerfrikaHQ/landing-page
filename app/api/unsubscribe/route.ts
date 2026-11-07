import {
	recordUnsubscribe,
	verifyUnsubscribeToken,
} from "@/src/lib/email-unsubscribe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const url = new URL(req.url);
	const email = url.searchParams.get("e");
	const token = url.searchParams.get("t");

	if (!email || !token || !verifyUnsubscribeToken(email, token)) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	await recordUnsubscribe(email);
	return NextResponse.json({ ok: true });
}
