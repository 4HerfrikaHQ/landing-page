import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/resend";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { env } from "@/utils/env";
import prisma from "@/utils/prisma";
import { text, html } from "@/utils/email";
import { apiBasePath, basePath } from "../../backoffice/options";

const config: NextAuthConfig = {
  session: { strategy: "database" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/backoffice/auth",
    error: "/backoffice/auth/error",
  },
  providers: [
    EmailProvider({
      name: "Email",
      apiKey: env.RESEND_API_KEY,
      from: "4Herfrika Authenticate <no-reply@4herfrika.org>",
      async sendVerificationRequest(params) {
        const { identifier: to, provider, url, theme } = params;
        const { host } = new URL(url);
        const resend = new Resend(env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
          from: provider.from!,
          to,
          subject: "Sign in to 4Herfrika",
          html: html({ url, host, theme }),
          text: text({ url, host }),
        });
        if (error) {
          console.error("SignIn Error::", error);
          throw new Error("Failed to send email");
        }
      },
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
