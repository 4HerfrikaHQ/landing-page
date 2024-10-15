"use server";
import { prisma } from "@/prisma";

export function hello() {
  return prisma.user.findMany();
}
