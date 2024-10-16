import { NextAdmin, PageProps } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { prisma } from "@/prisma";
import { basePath, apiBasePath, options } from "../options";
import schema from "@/prisma/json-schema/json-schema.json";

export default async function Admin({
  params,
  searchParams,
}: Readonly<PageProps>) {
  const props = await getNextAdminProps({
    params: params.all,
    searchParams,
    basePath,
    apiBasePath,
    schema,
    prisma,
  });

  return (
    <NextAdmin
      isAppDir
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/admin/logout",
      }}
      options={options}
      {...props}
    />
  );
}
