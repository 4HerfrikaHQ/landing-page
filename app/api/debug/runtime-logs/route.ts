import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
	if (process.env.VERCEL_ENV !== "preview") {
		return new NextResponse(null, { status: 404 });
	}

	const requestedProbeId = new URL(request.url).searchParams.get("probe");
	const probeId =
		requestedProbeId && /^[a-zA-Z0-9-]{1,64}$/.test(requestedProbeId)
			? requestedProbeId
			: crypto.randomUUID();
	const context = {
		probeId,
		deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
		gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
	};

	console.log("[runtime-log-probe] info", context);
	console.warn("[runtime-log-probe] warning", context);
	console.error("[runtime-log-probe] error", context);

	return NextResponse.json({ ok: true, probeId });
}
