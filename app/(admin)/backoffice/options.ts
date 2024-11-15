import { NextAdminOptions } from "@premieroctet/next-admin";

export const basePath = "/backoffice";

export const apiBasePath = "/api/admin";

export const options: NextAdminOptions = {
  title: "4Herfrika",
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
        models: ["User"],
      },
    ],
  },
};
