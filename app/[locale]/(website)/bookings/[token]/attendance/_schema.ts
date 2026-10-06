import { MentorAttendance } from "@/src/db/schema/tables/bookings";
import { z } from "zod";

export const ConfirmAttendanceSchema = z.object({
	token: z.string(),
	attendance: MentorAttendance,
});
export type ConfirmAttendanceInput = z.infer<typeof ConfirmAttendanceSchema>;
