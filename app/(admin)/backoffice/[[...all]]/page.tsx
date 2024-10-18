"use client";
import { NextAdmin, PageProps } from "@premieroctet/next-admin";
import { useAsync } from "react-use";
import { getPropsFromParams } from "../actions";
import { apiBasePath, basePath, options } from "../options";

export const runtime = "edge";

export default function Admin({ params, searchParams }: Readonly<PageProps>) {
  const { value: props } = useAsync(
    () => getPropsFromParams({ params: params.all, searchParams }),
    [params]
  );
  return props ? (
    <NextAdmin
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/admin/logout",
      }}
      {...props}
    />
  ) : (
    <NextAdmin
      isAppDir
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/admin/logout",
      }}
      options={options}
      apiBasePath={apiBasePath}
      basePath={basePath}
    />
  );
}
