import { lazy } from "react";
import type { PageProps } from "@premieroctet/next-admin";
import { SessionProvider } from "next-auth/react";
import { getAdminProps } from "../actions";

const NextAdmin = lazy(async () => ({
  default: (await import("@premieroctet/next-admin")).NextAdmin,
}));

export default async function Admin({
  params,
  searchParams,
}: Readonly<PageProps>) {
  const { session, ...props } = await getAdminProps({
    params: params.nextadmin,
    searchParams,
  });
  return (
    <SessionProvider basePath="/api/auth" session={session ?? null}>
      <NextAdmin isAppDir {...props} />
    </SessionProvider>
  );
}
