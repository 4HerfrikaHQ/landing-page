import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-prismic-secret");
  if (authHeader !== process.env.PRISMIC_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await revalidateTag("prismic", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
