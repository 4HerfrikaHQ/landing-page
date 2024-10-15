import { NextAdminOptions } from "@premieroctet/next-admin";

export const basePath = "/backoffice";

export const apiBasePath = "/api/admin";

export const options: NextAdminOptions = {
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
