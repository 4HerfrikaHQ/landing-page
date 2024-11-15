"use server";
import { prisma } from "@/prisma";
import {
  getMainLayoutProps,
  getNextAdminProps,
} from "@premieroctet/next-admin/appRouter";
import {
  basePath,
  apiBasePath,
  options,
} from "@/app/(admin)/backoffice/options";
import schema from "@/prisma/json-schema/json-schema.json";
import type { PageProps } from "@premieroctet/next-admin";

export async function getUser() {
  return prisma.user.findMany();
}

export const getMainProps = async () => {
  const props = getMainLayoutProps({
    basePath,
    apiBasePath,
    options,
  });

  return props;
};

export async function getAdminProps({
  params,
  searchParams,
}: Readonly<PageProps>) {
  return await getNextAdminProps({
    params: params.all,
    searchParams,
    basePath,
    apiBasePath,
    prisma,
    schema,
  });
}
