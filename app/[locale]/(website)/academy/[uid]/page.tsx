import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCourse } from "../_content";
import { CourseAside, EnrolledSummary } from "./_components/course-aside";
import {
	CertificateInfo,
	LicenceNotice,
	Outcomes,
} from "./_components/course-details";
import { CourseHeader } from "./_components/course-header";
import { CourseOutline } from "./_components/course-outline";
import { CourseUpdating } from "./_components/course-updating";
import { FinishPanel } from "./_components/finish-panel";
import { StickyStartBar } from "./_components/sticky-start-bar";
import { activePolicy, isCourseOpenForEnrolment } from "./_helpers";
import { loadViewer } from "./_viewer";

const loadCourse = cache(getCourse);

export async function generateMetadata({
	params,
}: {
	params: Promise<{ uid: string }>;
}): Promise<Metadata> {
	const { uid } = await params;
	const [course, t] = await Promise.all([
		loadCourse(uid),
		getTranslations("academy.course"),
	]);
	if (!course) return {};
	return {
		title: course.title,
		description: course.summary ?? t("metaFallback"),
	};
}

export default async function CoursePage({
	params,
}: {
	params: Promise<{ uid: string }>;
}) {
	const { uid } = await params;
	const course = await loadCourse(uid);
	if (!course) notFound();
	const viewer = await loadViewer(course);
	const open = isCourseOpenForEnrolment(course);
	const policy = activePolicy(course, viewer);

	return (
		<main className="bg-linear-to-b from-surface-pink via-white to-white px-5 pt-6 lg:px-8">
			<div className="mx-auto grid max-w-6xl gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12 lg:pt-6">
				<div className="flex min-w-0 flex-col gap-8">
					<CourseHeader
						course={course}
						showMyLearning={viewer.kind === "enrolled"}
					/>
					<CourseBody
						course={course}
						viewer={viewer}
						open={open}
						policy={policy}
					/>
				</div>
				<CourseSide course={course} viewer={viewer} open={open} />
			</div>
			<StartBar course={course} viewer={viewer} open={open} />
		</main>
	);
}

type SectionProps = {
	course: NonNullable<Awaited<ReturnType<typeof loadCourse>>>;
	viewer: Awaited<ReturnType<typeof loadViewer>>;
	open: boolean;
};

function CourseBody({
	course,
	viewer,
	open,
	policy,
}: SectionProps & { policy: typeof course.policy }) {
	return (
		<>
			<Updating open={open} />
			<SummaryCard course={course} viewer={viewer} open={open} />
			<Outcomes outcomes={course.outcomes} />
			<FinishPanel course={course} policy={policy} className="lg:hidden" />
			<CourseOutline course={course} viewer={viewer} />
			<CertificateInfo certificate={course.certificate} />
			<LicenceNotice notice={course.notice} />
		</>
	);
}

function Updating({ open }: { open: boolean }) {
	if (open) return null;
	return <CourseUpdating />;
}

function CourseSide({ course, viewer, open }: SectionProps) {
	if (!open) return null;
	return <CourseAside course={course} viewer={viewer} />;
}

function StartBar({ course, viewer, open }: SectionProps) {
	if (!open || viewer.kind === "enrolled") return null;
	return <StickyStartBar course={course} viewer={viewer} />;
}

function SummaryCard({ course, viewer, open }: SectionProps) {
	if (!open) return null;
	return <EnrolledSummary course={course} viewer={viewer} />;
}
