import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { env } from "./env";

const prismaClient = {
  get client() {
    try {
      const client = createClient({
        url: env.DATABASE_URL,
        authToken: env.AUTH_TOKEN,
      });
      return new PrismaClient({
        adapter: new PrismaLibSQL(client),
      });
    } catch {
      return new PrismaClient();
    }
  },
};

export default prismaClient.client;
