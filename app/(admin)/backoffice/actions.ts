"use server";
import type { Prisma } from "@prisma/client";
import type { AdminComponentProps, PageProps } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import prisma from "@/utils/prisma";
import schema from "@/prisma/json-schema/json-schema.json";
import { getOptions, apiBasePath, basePath } from "./options";

const superAdminResources: Partial<Prisma.ModelName>[] = [
  "User",
  "Authenticator",
  "Account",
  "VerificationToken",
  "Session",
];

export const getAdminProps = async ({
  params,
  searchParams,
}: {
  params: string | string[];
  searchParams: PageProps["searchParams"];
}): Promise<AdminComponentProps> => {
  const { isSuperAdmin, session, ...options } = await getOptions();
  const props = await getNextAdminProps({
    params,
    searchParams,
    prisma,
    options,
    basePath,
    apiBasePath,
    schema,
  });

  const resources =
    (!isSuperAdmin
      ? props.resources?.filter((r) => !superAdminResources.includes(r))
      : props.resources) ?? [];

  return {
    ...props,
    ...options,
    resources,
    resourcesTitles: resources.reduce((acc, r) => {
      // @ts-expect-error type not defined
      acc[r] = props?.resourcesTitles?.[r] ?? r;
      return acc;
    }, {} as Record<string, string>),
    resourcesIdProperty: resources.reduce((acc, r) => {
      // @ts-expect-error type not defined
      acc[r] = props?.resourcesIdProperty?.[r] ?? "id";
      return acc;
    }, {} as Record<string, string>),
    user: session?.user
      ? {
          data: {
            name: session.user.name || session.user.email!,
            picture:
              session.user.image! ||
              `https://www.gravatar.com/avatar/${session.user.email}&d=wavatar`,
          },
          logout: "/backoffice/auth?action=signout",
        }
      : undefined,
  };
};
