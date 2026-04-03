import { db } from "@/src/db";
import { schema } from "@/src/db";
import { eq, ilike, or } from "drizzle-orm";

export async function getMentorsForAdmin(query?: string) {
	return db
		.select({
			id: schema.mentors.id,
			name: schema.mentors.name,
			position: schema.mentors.position,
			email: schema.users.email,
			created_at: schema.mentors.created_at,
		})
		.from(schema.mentors)
		.innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
		.where(
			query
				? or(
						ilike(schema.mentors.name, `%${query}%`),
						ilike(schema.mentors.position, `%${query}%`),
					)
				: undefined,
		);
}
