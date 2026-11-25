import { Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function InactivePreviewBanner({
	isInactivePreview,
	isAdminPreview,
}: {
	isInactivePreview: boolean;
	isAdminPreview: boolean;
}) {
	if (!isInactivePreview) return null;
	const t = await getTranslations("mentorProfile.inactivePreview");
	const body = isAdminPreview ? t("adminBody") : t("ownerBody");

	return (
		<div className="border-b border-amber-500/20 bg-amber-50 text-amber-950">
			<div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:px-6 lg:px-8">
				<Eye
					className="mt-0.5 size-5 shrink-0 text-amber-700"
					aria-hidden="true"
				/>
				<p className="text-sm leading-6">
					<span className="font-semibold">{t("title")}</span> {body}
				</p>
			</div>
		</div>
	);
}
