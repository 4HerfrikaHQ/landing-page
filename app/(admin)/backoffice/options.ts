import { NextAdminOptions, SidebarGroup } from "@premieroctet/next-admin";
import prisma from "@/utils/prisma";
import { auth } from "../api/auth/config";

export const basePath = "/backoffice";

export const apiBasePath = "/api/admin";

const options: NextAdminOptions = {
  title: "💬 4Herfrika",
  model: {
    User: {
      toString: (user) => user.name ?? user.email,
    },
    Contact: {
      permissions: ["delete"],
    },
    Role: {
      toString: (role) => role.name,
      permissions: ["create", "delete"],
    },
  },
  pages: {
    "/custom": {
      title: "Custom page",
      icon: "AdjustmentsHorizontalIcon",
    },
  },
  externalLinks: [
    {
      label: "Homepage",
      url: "/",
    },
  ],
  sidebar: {
    groups: [
      {
        title: "Blog Posts",
        models: ["Post"],
      },
      {
        title: "Career Mentors",
        models: ["Mentor"],
      },
      {
        title: "Contact Messages",
        models: ["Contact"],
      },
    ],
  },
};

const superAdminSidebar: SidebarGroup[] = [
  {
    title: "Manage Admins",
    models: ["User"],
  },
  {
    title: "Manage Admin Roles",
    models: ["Role"],
  },
];

export enum AdminRole {
  Admin,
  SuperAdmin,
}

export const getOptions = async (): Promise<NextAdminOptions> => {
  const session = await auth();
  if (session) {
    if (session.user && session.user.email) {
      try {
        const admin = await prisma.user.findUnique({
          where: {
            email: session.user.email,
          },
        });
        if (admin && admin.roleId === AdminRole.SuperAdmin) {
          return {
            ...options,
            sidebar: {
              ...options.sidebar,
              groups: [
                ...(options?.sidebar?.groups ?? []),
                ...superAdminSidebar,
              ],
            },
          };
        }
      } catch {}
      return {};
    }
  }
  return options;
};
