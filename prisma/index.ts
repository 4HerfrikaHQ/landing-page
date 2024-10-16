import { generatePrismaClient } from "@/utils/prisma";
import { PrismaClient } from "@prisma/client";

export const prisma = generatePrismaClient();
