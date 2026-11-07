import type { Review } from "@/components/reviews/reviews-section";
import { z } from "zod";

export const academyType = z.enum(["tech", "business", "climate"]);

export type Academy = z.infer<typeof academyType>;

export const AcademyWaitlistSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().toLowerCase().email(),
	phone: z.string().trim().min(5).max(40),
	academy: academyType,
	location: z.string().trim().min(2).max(120),
});

export const academies = [
	{
		academy: "tech",
		name: "Tech Academy",
		description:
			"Master product design, web development, product management, and more. Join 1000+ women already shaping Africa's tech future.",
		image: "/assets/academy/tech-source.jpg",
	},
	{
		academy: "business",
		name: "Business Academy",
		description:
			"Turn your ideas into sustainable ventures with practical business skills, mentorship, and a community built to help you grow.",
		image: "/assets/academy/business-source.jpg",
	},
	{
		academy: "climate",
		name: "Climate Academy",
		description:
			"Shape Africa's environmental future. Build the skills to lead in green innovation, sustainability, and climate advocacy.",
		image: "/assets/academy/climate-source.jpg",
	},
] as const;

export const academyTranslationKeys = {
	tech: { name: "techAcademy", description: "techDescription" },
	business: { name: "businessAcademy", description: "businessDescription" },
	climate: { name: "climateAcademy", description: "climateDescription" },
} as const;

export const testimonials: readonly Review[] = [
	{
		id: "adesola-adewale",
		quote:
			"I came with no tech background. Now I'm a product designer at a global firm. This academy changed my entire career trajectory.",
		name: "Adesola Adewale",
		title: "Founder, ReadEvolve",
		image: { src: "/assets/academy/adesola_crop.png", alt: "Adesola Adewale" },
	},
	{
		id: "adeleke-glory",
		quote:
			"I walked in with an idea. I walked out with a registered business, three clients, and the confidence to lead a team.",
		name: "Adeleke Glory",
		title: "Student, Lautech Campus",
		image: { src: "/assets/academy/glory_crop.png", alt: "Adeleke Glory" },
	},
	{
		id: "elizabeth-akinmolayan",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Elizabeth Akinmolayan",
		title: "Student, FUTA Campus",
		image: {
			src: "/assets/academy/elizabeth_crop.png",
			alt: "Elizabeth Akinmolayan",
		},
	},
	{
		id: "olafisoye-theresa",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Olafisoye Theresa",
		title: "Campus lead, 4Herfrika FUTA campus",
		image: {
			src: "/assets/academy/theresa_crop.png",
			alt: "Olafisoye Theresa",
		},
	},
] as const;

export const navLinks = [
	["About Us", "/about"],
	["Projects", "/projects"],
	["Academy", "/academy"],
	["Career Corner", "/careercorner"],
	["Blog", "/blog"],
	["Contact Us", "/contact-us"],
] as const;
