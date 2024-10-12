"use server";
import { prisma } from "@/utils/prisma";

export function hello() {
  return prisma().user.findMany();
}
