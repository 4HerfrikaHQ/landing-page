"use server";
import { prisma } from "@/prisma";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { basePath, apiBasePath } from "@/app/(admin)/backoffice/options";
import schema from "@/prisma/json-schema/json-schema.json";
import type { PageProps } from "@premieroctet/next-admin";

export async function getUser() {
  return prisma.user.findMany();
}

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
