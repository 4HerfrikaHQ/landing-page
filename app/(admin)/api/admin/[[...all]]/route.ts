import { createHandler } from "@premieroctet/next-admin/appHandler";
import prisma from "@/utils/prisma";
import { options, apiBasePath } from "@/app/(admin)/backoffice/options";
import schema from "@/prisma/json-schema/json-schema.json";

const { run } = createHandler({
  apiBasePath,
  options,
  schema,
  prisma,
});

export { run as DELETE, run as GET, run as PATCH, run as POST, run as PUT };
