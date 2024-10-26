import type { Session } from "next-auth";
import { NextAdminOptions, SidebarGroup } from "@premieroctet/next-admin";
import prisma from "@/utils/prisma";
import { auth } from "../api/auth/config";
import { createElement } from "react";

export const basePath = "/backoffice";

export const apiBasePath = "/api/admin";

const textarea = createElement("textarea", {
  className:
    "dark:bg-dark-nextadmin-background-subtle text-nextadmin-content-inverted dark:text-dark-nextadmin-content-inverted ring-nextadmin-border-default focus:ring-nextadmin-brand-default dark:focus:ring-dark-nextadmin-brand-default dark:ring-dark-nextadmin-border-strong block w-full rounded-md border-0 px-2 py-1.5 text-sm shadow-sm ring-1 ring-inset transition-colors duration-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:leading-6",
  rows: 10,
});

function timeSince(date: Date) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const intervals = [
    { label: "years", seconds: 31536000 },
    { label: "months", seconds: 2592000 },
    { label: "days", seconds: 86400 },
    { label: "hours", seconds: 3600 },
    { label: "minutes", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} ago`;
    }
  }
  return "just now";
}

const options: NextAdminOptions = {
  title: "💬 4Herfrika",
  model: {
    User: {
      toString: (item) => item.email ?? item.id,
      permissions: [],
      list: {
        display: [],
      },
      edit: {
        display: ["email", "name", "image"],
        fields: {
          image: {
            format: "file",
          },
        },
      },
    },
    Contact: {
      toString: (item) => item.email ?? item.id,
      permissions: ["delete"],
      list: {
        display: ["name", "email", "message", "createdAt"],
      },
    },
    Mentor: {
      toString: (item) => item.name ?? item.email ?? item.id,
      list: {
        display: ["name", "email", "createdAt"],
      },
      edit: {
        fields: {
          picture: {
            format: "file",
          },
          bio: {
            format: "textarea",
            input: textarea,
          },
        },
      },
    },
    VerificationToken: {
      permissions: ["delete"],
    },
    Session: {
      permissions: ["delete"],
    },
    Account: {
      permissions: ["delete", "edit"],
    },
    Post: {
      list: {
        display: ["title", "author", "published", "createdAt"],
        fields: {
          author: {
            formatter(item) {
              return item.name ?? item.email ?? item.id;
            },
          },
          published: {
            formatter(published) {
              return published ? "Published" : "Draft";
            },
          },
          createdAt: {
            formatter(createdAt) {
              // createdAt is a Date object, format to x hours ago
              return timeSince(createdAt);
            },
          },
        },
      },
      edit: {
        display: ["title", "author", "published", "content"],
        fields: {
          content: {
            format: "textarea",
            input: textarea,
          },
          author: {
            optionFormatter(item) {
              return item.name ?? item.email ?? item.id;
            },
          },
        },
      },
    },
  },
  externalLinks: [
    {
      label: "Website",
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
    title: "Manage Authenticators",
    models: ["Authenticator"],
  },
  {
    title: "Manage Accounts",
    models: ["Account"],
  },
  {
    title: "Manage Verification Tokens",
    models: ["VerificationToken"],
  },
  {
    title: "Manage Sessions",
    models: ["Session"],
  },
];

export enum AdminRole {
  Admin,
  SuperAdmin,
}

export const getOptions = async (): Promise<
  NextAdminOptions & { isSuperAdmin?: true; session?: Session }
> => {
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
            model: {
              ...options.model,
              User: {
                toString: (item) => item.email ?? item.id,
                permissions: ["delete", "edit"],
                list: {
                  display: [
                    "email",
                    "roleId",
                    "createdAt",
                    "sessions",
                    "posts",
                  ],
                },
              },
            },
            sidebar: {
              ...options.sidebar,
              groups: [
                ...(options?.sidebar?.groups ?? []),
                ...superAdminSidebar,
              ],
            },
            isSuperAdmin: true,
            session,
          };
        }
      } catch {}
    }
  }
  return { ...options };
};
