import {
	CalendarClockIcon,
	ClipboardCheckIcon,
	ClockIcon,
	VideoIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const ITEMS = [
	{ icon: ClockIcon, title: "timeTitle", body: "timeBody" },
	{ icon: VideoIcon, title: "callsTitle", body: "callsBody" },
	{ icon: CalendarClockIcon, title: "scheduleTitle", body: "scheduleBody" },
	{ icon: ClipboardCheckIcon, title: "reviewTitle", body: "reviewBody" },
] as const;

export async function MentorApplyAside() {
	const t = await getTranslations("mentorApply.aside");

	return (
		<aside
			aria-labelledby="mentor-apply-aside-title"
			className="rounded-[20px] bg-surface-pink p-6 lg:sticky lg:top-32 lg:p-8"
		>
			<span className="inline-block rounded-pill bg-white px-3 py-1.5 text-xs text-primary-500">
				{t("badge")}
			</span>
			<h2
				id="mentor-apply-aside-title"
				className="mt-4 text-2xl font-bold leading-tight text-secondary-500"
			>
				{t("title")}
			</h2>
			<ul className="mt-6 space-y-5">
				{ITEMS.map((item) => (
					<li key={item.title} className="flex gap-4">
						<span
							aria-hidden="true"
							className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-primary-500"
						>
							<item.icon className="size-5" strokeWidth={1.75} />
						</span>
						<div>
							<h3 className="font-semibold text-secondary-500">
								{t(item.title)}
							</h3>
							<p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
								{t(item.body)}
							</p>
						</div>
					</li>
				))}
			</ul>
		</aside>
	);
}
