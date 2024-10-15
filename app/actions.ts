"use server";
import { prisma } from "@/prisma";

export function getUser() {
  return prisma.user.findMany();
}
