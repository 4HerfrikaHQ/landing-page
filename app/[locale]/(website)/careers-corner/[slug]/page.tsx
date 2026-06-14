import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getInitialWeekStart, getMentorBySlug } from "./_actions";
import { BookingSection } from "./_components/booking-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const mentor = await getMentorBySlug(slug);
	if (!mentor) return { title: "Mentor not found — 4HerFrika" };
	return {
		title: `Book a call with ${mentor.name} — 4HerFrika`,
		description:
			mentor.bio?.slice(0, 160) ?? `Book a 30-minute call with ${mentor.name}.`,
	};
}

export default async function MentorDetailPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;
	setRequestLocale(locale as Locale);

	const mentor = await getMentorBySlug(slug);
	if (!mentor) notFound();

	const initialWeekStart = await getInitialWeekStart(mentor.slug);

	return (
		<main className="mx-auto max-w-3xl px-4 py-12">
			<header className="flex items-center gap-4">
				{mentor.image && (
					<Image
						src={mentor.image}
						alt={mentor.name}
						width={80}
						height={80}
						unoptimized={mentor.image.includes("localhost")}
						className="rounded-full object-cover"
					/>
				)}
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						{mentor.name}
					</h1>
					<p className="text-gray-500">{mentor.position}</p>
					{mentor.linkedin_url && (
						<a
							href={mentor.linkedin_url}
							target="_blank"
							rel="noreferrer"
							className="text-xs text-primary-500 underline mt-1 inline-block"
						>
							LinkedIn
						</a>
					)}
				</div>
			</header>

			{mentor.bio && (
				<p className="mt-6 whitespace-pre-wrap text-gray-700">{mentor.bio}</p>
			)}

			<section className="mt-12">
				<h2 className="text-lg font-semibold text-gray-900">
					Book a 30-minute call
				</h2>
				<p className="mt-1 text-sm text-gray-500">
					Pick a time that works for you. Times are shown in your local
					timezone.
				</p>
				<div className="mt-6">
					<BookingSection
						mentorSlug={mentor.slug}
						mentorName={mentor.name}
						initialWeekStart={initialWeekStart}
					/>
				</div>
			</section>
		</main>
	);
}
