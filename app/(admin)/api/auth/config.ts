import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/sendgrid";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/utils/env";
import prisma from "@/utils/prisma";
import { apiBasePath, basePath } from "../../backoffice/options";

const config: NextAuthConfig = {
  session: { strategy: "database" },
  secret: env.AUTH_SECRET,
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma.client),
  providers: [
    EmailProvider({
      name: "Email",
      server: env.EMAIL_SERVER,
      from: `4Herfrika Authenticate <no-reply@${env.SERVER_URL}>`,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith(basePath) || pathname.startsWith(apiBasePath))
        return !!auth;
      return true;
    },
  },
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);
