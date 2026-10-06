import { z } from "zod";

export const ConfirmAttendanceSchema = z.object({
	token: z.string(),
	attended: z.boolean(),
});
export type ConfirmAttendanceInput = z.infer<typeof ConfirmAttendanceSchema>;
