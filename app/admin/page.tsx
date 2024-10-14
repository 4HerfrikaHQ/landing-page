import { prisma } from "@/utils/prisma";
import { NextAdmin, NextAdminOptions } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";

const basePath = "/admin";

const apiBasePath = "/admin";

const options: NextAdminOptions = {
  title: "⚡️ Admin",
  model: {
    /* Your model configuration here */
  },
  pages: {
    "/custom": {
      title: "Custom page",
      icon: "AdjustmentsHorizontalIcon",
    },
  },
  externalLinks: [
    {
      label: "App Router",
      url: "/",
    },
  ],
  sidebar: {
    groups: [
      {
        title: "Users",
        className: " bg-green-600 p-2 rounded-md", // group title extra classes. (optional)
        models: ["User"],
      },
      {
        title: "Categories",
        // @ts-expect-error "Category" model does not exist
        models: ["Category"],
      },
    ],
  },
};

export default function Admin({
  params,
  searchParams,
}: {
  params: string[];
  searchParams: { [key: string]: string };
}) {
  const props = getNextAdminProps({
    params,
    searchParams,
    basePath,
    apiBasePath,
    schema: "",
    prisma: prisma(),
  });

  return (
    <NextAdmin
      isAppDir
      basePath={basePath}
      apiBasePath={apiBasePath}
      user={{
        data: {
          name: "John Doe",
        },
        logout: "/api/auth/logout",
      }}
      options={options}
      {...props}
    />
  );
}
