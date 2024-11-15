"use client";
import { NextAdmin } from "@premieroctet/next-admin";
import { apiBasePath, basePath, options } from "../options";

export const runtime = "edge";

export default function Admin(/**_props: Readonly<PageProps> */) {
  return (
    <NextAdmin
      isAppDir
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/admin/logout",
      }}
      options={options}
      basePath={basePath}
      apiBasePath={apiBasePath}
    />
  );
}
