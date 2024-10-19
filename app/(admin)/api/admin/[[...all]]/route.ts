// import { prisma } from "@/prisma";
// import { options, apiBasePath } from "@/app/(admin)/backoffice/options";
// import schema from "@/prisma/json-schema/json-schema.json";
import { NextRequest, NextResponse } from "next/server";
import type { RequestContext } from "@premieroctet/next-admin";

export const runtime = "edge";

export async function GET(request: NextRequest, ctx: RequestContext<"all">) {
  console.log("GET /api/admin", request.body, ctx);
  return new NextResponse();
}

export async function POST(request: NextRequest, ctx: RequestContext<"all">) {
  console.log("POST /api/admin", request.body, ctx);
  return new NextResponse();
}

export async function DELETE(request: NextRequest, ctx: RequestContext<"all">) {
  console.log("DELETE /api/admin", request.body, ctx);
  return new NextResponse();
}
