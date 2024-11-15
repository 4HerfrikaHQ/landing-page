import { createHandler } from "@premieroctet/next-admin/appHandler";
import prisma from "@/utils/prisma";
import { getOptions, apiBasePath } from "@/app/(admin)/backoffice/options";
import schema from "@/prisma/json-schema/json-schema.json";
import { RequestContext } from "@premieroctet/next-admin";
import { NextRequest } from "next/server";

let runHandler: (
  req: NextRequest,
  ctx: RequestContext<"nextadmin">
) => Promise<Response>;

const handler = async (req: NextRequest, ctx: RequestContext<"nextadmin">) => {
  if (!runHandler) {
    const { run } = createHandler({
      apiBasePath,
      options: await getOptions(),
      schema,
      prisma,
    });
    runHandler = run;
  }

  return runHandler(req, ctx);
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
