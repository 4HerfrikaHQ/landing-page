"use server";
import { Prisma } from "@prisma/client/edge";
import type { AdminComponentProps, PageProps } from "@premieroctet/next-admin";
import { prisma } from "@/prisma";
import { options, apiBasePath, basePath } from "./options";
import { buildProps, getMainLayoutProps } from "../api/admin/utils";

export const getPropsFromParams = async ({
  params,
  searchParams,
}: {
  params: string | string[];
  searchParams: PageProps["searchParams"];
}): Promise<
  | AdminComponentProps
  | Omit<AdminComponentProps, "dmmfSchema" | "schema" | "resource" | "action">
  | Pick<
      AdminComponentProps,
      | "pageComponent"
      | "basePath"
      | "apiBasePath"
      | "isAppDir"
      | "message"
      | "resources"
      | "error"
    >
> => {
  if (params !== undefined && !Array.isArray(params)) {
    throw new Error(
      "`params` parameter in `getMainLayoutProps` should be an array of strings."
    );
  }
  const { models } = Prisma.dmmf.datamodel;
  const baseProps = getMainLayoutProps({
    basePath,
    apiBasePath,
    options,
    params,
    models,
  });

  if (!params) return baseProps;
  return buildProps({
    baseProps,
    params,
    searchParams,
    models,
    prisma,
    options,
  });
};
