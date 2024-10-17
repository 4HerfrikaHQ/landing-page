"use client";
import { NextAdmin, PageProps } from "@premieroctet/next-admin";
import { options } from "../options";
import { useAsync } from "react-use";
import { getAdminProps } from "@/app/actions";

export default function Admin({ params, searchParams }: Readonly<PageProps>) {
  const { value: props } = useAsync(
    () => getAdminProps({ params, searchParams }),
    [params, searchParams]
  );

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
      {...props!}
    />
  );
}
