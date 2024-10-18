import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { env } from "../../env";

const providers = [
  EmailProvider({
    server: env.EMAIL_SERVER,
    from: env.EMAIL_FROM,
  }),
  GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
];

const handler = NextAuth({
  providers,
});

export { handler as GET, handler as POST };
