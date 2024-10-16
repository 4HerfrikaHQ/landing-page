import { prisma } from "@/prisma";
import { options } from "@/app/(admin)/backoffice/options";
import schema from "@/prisma/json-schema/json-schema.json";
import { createHandler } from "@premieroctet/next-admin/appHandler";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  options,
  prisma,
  schema,
  paramKey: "all",
});

export { run as DELETE, run as GET, run as POST };
