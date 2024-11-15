import { NextAdmin } from "@premieroctet/next-admin";
import type { PageProps } from "@premieroctet/next-admin";
import { getAdminProps } from "../actions";

export default async function Admin({
  params,
  searchParams,
}: Readonly<PageProps>) {
  const props = await getAdminProps({
    params: params.nextadmin,
    searchParams,
  });
  return <NextAdmin isAppDir {...props} />;
}
