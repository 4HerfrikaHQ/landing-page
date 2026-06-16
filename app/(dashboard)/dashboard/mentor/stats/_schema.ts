import { z } from "zod";

export const StatsRange = z.enum(["30d", "90d", "all"]);
export type StatsRange = z.infer<typeof StatsRange>;

export const RANGE_DAYS: Record<Exclude<StatsRange, "all">, number> = {
	"30d": 30,
	"90d": 90,
};
