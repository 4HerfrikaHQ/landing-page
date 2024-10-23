"use server";
import type { Session } from "next-auth";
import type { AdminComponentProps, PageProps } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import prisma from "@/utils/prisma";
import schema from "@/prisma/json-schema/json-schema.json";
import { getOptions, apiBasePath, basePath } from "./options";
import { auth } from "../api/auth/config";

export const getAdminProps = async ({
  params,
  searchParams,
}: {
  params: string | string[];
  searchParams: PageProps["searchParams"];
}): Promise<AdminComponentProps & { session?: Session }> => {
  const session = await auth();
  const props = await getNextAdminProps({
    params,
    searchParams,
    options: await getOptions(),
    prisma,
    basePath,
    apiBasePath,
    schema,
  });
  return {
    ...props,
    user: session?.user
      ? {
          data: {
            name: session.user.name!,
          },
          logout: "/api/auth/logout",
        }
      : undefined,
    session: session ?? undefined,
  };
};
