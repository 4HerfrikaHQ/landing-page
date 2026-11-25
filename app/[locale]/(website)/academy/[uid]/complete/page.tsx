import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { findCertificateByEnrolment } from "../../../certificates/_certificate";
import {
	certificatePath,
	certificateUrl,
	formatCertificateDate,
	siteUrl,
} from "../../../certificates/_helpers";
import { getCourse } from "../../_content";
import { findEnrolment } from "../../_enrolment";
import { requireLearner } from "../../_learner";
import { localizedPath } from "../../sign-in/_helpers";
import { completePath, coursePath } from "../_helpers";
import { CompleteScreen } from "./_components/complete-screen";

type Params = { uid: string };

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("academy.complete");
	return { title: t("metaTitle"), robots: { index: false } };
}

export default async function CompletePage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { uid } = await params;
	const locale = await getLocale();
	const learner = await requireLearner(
		localizedPath(locale, completePath(uid)),
	);
	const course = await getCourse(uid);
	if (!course) notFound();
	const courseHref = localizedPath(locale, coursePath(uid));
	const enrolment = await findEnrolment(learner.id, course.id);
	if (!enrolment?.completed_at) redirect(courseHref);
	const certificate = await findCertificateByEnrolment(enrolment.id);
	if (!certificate) redirect(courseHref);
	if (certificate.revoked_at) {
		redirect(certificatePath(locale, certificate.code));
	}

	return (
		<CompleteScreen
			firstName={learner.certificate_name.split(/\s+/)[0]}
			course={course}
			certificate={certificate}
			completedLabel={formatCertificateDate(certificate.completed_at, locale)}
			url={certificateUrl(siteUrl(), locale, certificate.code)}
			printHref={`${certificatePath(locale, certificate.code)}/print`}
		/>
	);
}
