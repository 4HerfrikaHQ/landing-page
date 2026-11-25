import { FadeIn } from "@/components/motion/fade-in";
import { getTranslations } from "next-intl/server";
import { getCourses } from "../_content";
import { CatalogBrowser, type CatalogItem } from "./catalog-browser";
import { CourseCard } from "./course-card";

async function loadCourses() {
	try {
		return await getCourses();
	} catch (error) {
		console.error("[academy] could not load the course catalog", error);
		return [];
	}
}

export async function CourseCatalog() {
	const [t, courses] = await Promise.all([
		getTranslations("academy.catalog"),
		loadCourses(),
	]);
	const items: CatalogItem[] = courses.map((course) => ({
		uid: course.uid,
		track: course.track,
		card: <CourseCard course={course} />,
	}));

	return (
		<section
			id="courses"
			aria-labelledby="catalog-title"
			className="scroll-mt-24 bg-white px-6 py-16 lg:px-12 xl:py-24 2xl:px-20"
		>
			<div className="mx-auto max-w-7xl">
				<FadeIn>
					<h2
						id="catalog-title"
						className="text-4xl font-bold leading-tight text-secondary-500 sm:text-5xl"
					>
						{t("titleFirst")}
						<br />
						<em className="font-playfair font-extrabold text-primary-500">
							{t("titleSecond")}
						</em>
					</h2>
					<p className="mt-4 max-w-xl text-lg leading-7 text-muted-foreground">
						{t("subtitle")}
					</p>
				</FadeIn>
				<CatalogBrowser items={items} />
			</div>
		</section>
	);
}
