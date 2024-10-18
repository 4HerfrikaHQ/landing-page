"use server";
import { prisma } from "@/prisma";
// import {
//   getMainLayoutProps,
//   getNextAdminProps,
// } from "@premieroctet/next-admin/appRouter";
// import {
//   basePath,
//   apiBasePath,
//   options,
// } from "@/app/(admin)/backoffice/options";
// import schema from "@/prisma/json-schema/json-schema.json";
import type { UserData } from "@premieroctet/next-admin";

export async function getUserData(): Promise<UserData> {
  const user = await prisma.user.findFirst();
  return {
    name: user!.name!,
  };
}
