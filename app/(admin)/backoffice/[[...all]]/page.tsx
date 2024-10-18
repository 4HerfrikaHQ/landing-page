"use client";
import { NextAdmin, PageProps } from "@premieroctet/next-admin";
import { useAsync } from "react-use";
import { getPropsFromParams } from "../actions";

export const runtime = "edge";

export default function Admin({ params, searchParams }: Readonly<PageProps>) {
  const { value: props } = useAsync(
    () => getPropsFromParams({ params: params.all, searchParams }),
    [params]
  );
  return (
    <NextAdmin
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/admin/logout",
      }}
      {...props!}
    />
  );
}
