import type { Content } from "@prismicio/client";

export const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "1";

type Stub = {
	uid: string;
	name: string;
	university: string;
	country: string;
	summary: string;
	cover: string;
	leadAmbassador: string;
	leadAmbassadorRole?: string;
	leadAmbassadorPhoto?: string;
	leadAmbassadorBio?: string;
	leadAmbassadorSocials?: {
		platform: "LinkedIn" | "X" | "Instagram";
		url: string;
	}[];
	foundedDate: string;
	memberCount: number;
	body: string[];
	milestones?: { date: string; title: string; description?: string }[];
	events?: {
		date: string;
		title: string;
		location?: string;
		link?: string;
	}[];
	programs?: { name: string; description: string }[];
	testimonials?: {
		quote: string;
		name: string;
		role?: string;
		photo?: string;
	}[];
	relatedProjects?: {
		title: string;
		summary: string;
		slug: string;
		category?: string;
		coverUrl: string;
	}[];
	gallery: { url: string; caption: string }[];
	lastUpdated: string;
};

const DEFAULT_MILESTONES: { date: string; title: string; description?: string }[] = [];

const DEFAULT_PROGRAMS = [
	{
		name: "Tech Academy",
		description: "Intensive software and data bootcamps run each semester.",
	},
	{
		name: "Mentorship Circles",
		description: "Weekly small-group mentoring with industry leaders.",
	},
	{
		name: "Career Fair",
		description: "Annual recruiter showcase with partner companies.",
	},
];

const STUBS: Stub[] = [
	{
		uid: "university-of-lagos",
		name: "University of Lagos",
		university: "University of Lagos",
		country: "Nigeria",
		summary:
			"Where it all began. UNILAG hosts our flagship Tech Academy cohort and weekly mentorship circles across three faculties.",
		cover:
			"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Adesuwa Eze",
		leadAmbassadorRole: "Chapter President · Final-year Computer Science",
		leadAmbassadorPhoto:
			"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
		leadAmbassadorBio:
			"Adesuwa has led the UNILAG chapter since launch, scaling it from 12 founding members to 412. She's a former Andela fellow and runs the StopTheViolence outreach end-to-end.",
		leadAmbassadorSocials: [
			{ platform: "LinkedIn", url: "https://linkedin.com/in/adesuwa" },
			{ platform: "X", url: "https://x.com/adesuwa" },
		],
		foundedDate: "2023-09-12",
		memberCount: 412,
		body: [
			"UNILAG is where 4Herfrika started. In year one we ran weekly tech circles in the Faculty of Engineering, hosted three campus-wide career fairs, and graduated 86 women from our intro-to-software bootcamp.",
			"Today the chapter spans three faculties, with active leads in Computer Science, Business, and Mass Communication. Members meet every Wednesday for skill-share sessions and monthly for mentor pairing.",
			"Our biggest moment so far: the StopTheViolence schools outreach we ran across Lagos Mainland — driven entirely by UNILAG volunteers.",
		],
		milestones: [
			{
				date: "2023-09-12",
				title: "Chapter founded",
				description: "Officially launched in the Faculty of Engineering.",
			},
			{
				date: "2024-02-04",
				title: "First Tech Academy cohort",
				description: "86 women graduated from the intro-to-software bootcamp.",
			},
			{
				date: "2024-09-15",
				title: "StopTheViolence outreach",
				description: "Reached 700 students across Lagos Mainland schools.",
			},
			{
				date: "2025-03-10",
				title: "Three faculties active",
				description:
					"Chapter expanded into Business and Mass Communication faculties.",
			},
			{
				date: "2026-04-22",
				title: "412 active members",
				description: "Largest chapter in the network as of this update.",
			},
		],
		relatedProjects: [
			{
				title: "StopTheViolence: Akoka High School Outreach",
				summary:
					"700 students sensitized on gender-based violence. UNILAG volunteers led every session.",
				slug: "stop-the-violence",
				category: "Outreach",
				coverUrl:
					"https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
			},
			{
				title: "Girls Tech Bootcamp",
				summary:
					"86 women graduated from our intro-to-software bootcamp in the first UNILAG cohort.",
				slug: "girls-tech-bootcamp",
				category: "TechUp4Her",
				coverUrl:
					"https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80",
			},
		],
		testimonials: [
			{
				quote:
					"I came in shy and unsure if I belonged in tech. Two semesters later I'm leading my own study group and shipping side projects.",
				name: "Ifeoma O.",
				role: "200-level Computer Science",
				photo:
					"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
			},
			{
				quote:
					"The career fair is genuinely the reason I got my first internship. Three of my friends from the chapter got offers too.",
				name: "Bisola A.",
				role: "Mass Communication alum, '25",
				photo:
					"https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80",
			},
			{
				quote:
					"My mentor through 4Herfrika has changed how I think about my own career trajectory.",
				name: "Chiamaka N.",
				role: "Final-year Business Administration",
			},
		],
		events: [
			{
				date: "2026-06-08",
				title: "Tech Academy Cohort 5 kickoff",
				location: "Faculty of Engineering Auditorium",
			},
			{
				date: "2026-06-22",
				title: "Mentorship pairing night",
				location: "Faculty of Business",
			},
			{
				date: "2026-07-13",
				title: "Career fair: Lagos tech employers",
				location: "Multipurpose Hall",
			},
		],
		programs: [
			{
				name: "Tech Academy",
				description:
					"Flagship 12-week bootcamp in software engineering, data, and design across the Faculty of Engineering.",
			},
			{
				name: "Mentorship Circles",
				description:
					"Weekly small-group mentoring with senior women in tech, business, and media.",
			},
			{
				name: "StopTheViolence Outreach",
				description:
					"Schools outreach across Lagos Mainland on gender-based violence awareness.",
			},
			{
				name: "Campus Career Fair",
				description:
					"Annual recruiter showcase pairing members with partner companies hiring graduates.",
			},
		],
		gallery: [
			{
				url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80",
				caption: "Tech Academy cohort kickoff, Faculty of Engineering",
			},
			{
				url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
				caption: "Weekly mentorship circle",
			},
			{
				url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
				caption: "Campus career fair",
			},
		],
		lastUpdated: "2026-05-08",
	},
	{
		uid: "lautech",
		name: "LAUTECH",
		university: "Ladoke Akintola University of Technology",
		country: "Nigeria",
		summary:
			"Ogbomoso's powerhouse chapter — home to our largest single bootcamp graduating class to date.",
		cover:
			"https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Mojisola Adebayo",
		foundedDate: "2024-01-20",
		memberCount: 287,
		body: [
			"LAUTECH joined us in early 2024 and quickly became one of our most active campus chapters. The first cohort graduated 124 women — our largest single class to date.",
			"The chapter is run by a six-person student leadership team and meets every Saturday in the Computer Science building.",
		],
		gallery: [
			{
				url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
				caption: "Bootcamp graduation day",
			},
			{
				url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
				caption: "Saturday session in the CS building",
			},
		],
		lastUpdated: "2026-04-22",
	},
	{
		uid: "university-of-ghana",
		name: "University of Ghana, Legon",
		university: "University of Ghana",
		country: "Ghana",
		summary:
			"Our first chapter outside Nigeria. Anchored in Legon, leading on climate and entrepreneurship programming.",
		cover:
			"https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Akosua Mensah",
		leadAmbassadorRole: "Chapter Lead · Climate Studies",
		leadAmbassadorPhoto:
			"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
		leadAmbassadorBio:
			"Akosua launched the Legon chapter after returning from a UN Youth Climate Summit. She partners with the university's Centre for Climate Change to anchor every Academy event in current research.",
		leadAmbassadorSocials: [
			{ platform: "LinkedIn", url: "https://linkedin.com/in/akosua" },
		],
		foundedDate: "2024-03-04",
		memberCount: 198,
		body: [
			"Legon is our first chapter outside Nigeria and the home of our climate-focused programming. The chapter has driven two campus-wide tree planting initiatives and a women-in-renewables career week.",
			"The leadership team partners closely with the university's Centre for Climate Change to anchor every event in current research.",
		],
		milestones: [
			{
				date: "2024-03-04",
				title: "Chapter founded",
				description: "First 4Herfrika chapter outside Nigeria.",
			},
			{
				date: "2024-08-20",
				title: "Tree planting initiative",
				description: "Planted 300 trees across the Legon campus.",
			},
			{
				date: "2025-05-12",
				title: "Women-in-renewables career week",
				description:
					"Partnered with the Centre for Climate Change for a five-day showcase.",
			},
		],
		relatedProjects: [
			{
				title: "Women in Renewables Career Week",
				summary:
					"Five-day showcase partnering with the Centre for Climate Change.",
				slug: "girls-tech-bootcamp",
				category: "Climate",
				coverUrl:
					"https://images.unsplash.com/photo-1559131397-f94da358f7ca?auto=format&fit=crop&w=1200&q=80",
			},
		],
		testimonials: [
			{
				quote:
					"Joining the Legon chapter helped me find my voice on climate. I'm now leading our women-in-renewables outreach.",
				name: "Esi K.",
				role: "Climate Studies, 300-level",
				photo:
					"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
			},
			{
				quote:
					"The mentor pairings are next level. Mine is based in Nairobi and we meet every other week.",
				name: "Naomi A.",
				role: "Business School, final year",
			},
		],
		events: [
			{
				date: "2026-06-15",
				title: "Climate hackathon",
				location: "Centre for Climate Change",
			},
			{
				date: "2026-07-04",
				title: "Mentor mixer",
				location: "Legon Hall",
			},
		],
		programs: [
			{
				name: "Climate Academy",
				description:
					"Modules on renewable energy careers, run with the university's Centre for Climate Change.",
			},
			{
				name: "Entrepreneurship Lab",
				description:
					"Member-led venture incubator with monthly pitch sessions.",
			},
			{
				name: "Mentorship Circles",
				description: "Cross-Africa mentor pairings with bi-weekly group sessions.",
			},
		],
		gallery: [
			{
				url: "https://images.unsplash.com/photo-1559131397-f94da358f7ca?auto=format&fit=crop&w=1200&q=80",
				caption: "Women-in-renewables career week",
			},
			{
				url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80",
				caption: "Campus tree planting initiative",
			},
		],
		lastUpdated: "2026-05-01",
	},
	{
		uid: "fourah-bay-college",
		name: "Fourah Bay College",
		university: "Fourah Bay College, University of Sierra Leone",
		country: "Sierra Leone",
		summary:
			"Freetown's hilltop campus — small, tight-knit chapter focused on early-career mentorship.",
		cover:
			"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Isatu Kamara",
		foundedDate: "2024-06-15",
		memberCount: 94,
		body: [
			"Fourah Bay's chapter is small but mighty. With 94 members across three departments, the focus has been on intensive 1:1 mentorship pairings rather than mass cohorts.",
			"In year one, 71 of those members were paired with mentors based in Freetown, Accra, and Lagos.",
		],
		gallery: [],
		lastUpdated: "2026-03-29",
	},
	{
		uid: "strathmore-university",
		name: "Strathmore University",
		university: "Strathmore University",
		country: "Kenya",
		summary:
			"Nairobi-based business and tech chapter — strong startup-track programming and active alumnae network.",
		cover:
			"https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Wanjiru Kimani",
		foundedDate: "2024-09-02",
		memberCount: 156,
		body: [
			"Strathmore's chapter is anchored in the business school and runs a parallel startup-track program for members building ventures while studying.",
			"Three member-led startups have already gone through accelerator programs in Nairobi.",
		],
		gallery: [
			{
				url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
				caption: "Startup-track demo day",
			},
		],
		lastUpdated: "2026-04-30",
	},
	{
		uid: "university-of-buea",
		name: "University of Buea",
		university: "University of Buea",
		country: "Cameroon",
		summary:
			"Mount Cameroon's foothills — our newest chapter and the first in Cameroon.",
		cover:
			"https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1600&q=80",
		leadAmbassador: "Ngozi Eyong",
		foundedDate: "2025-02-10",
		memberCount: 63,
		body: [
			"Buea is our newest chapter and the first in Cameroon. The team is still in its founding cohort phase, with regular onboarding sessions every two weeks.",
		],
		gallery: [],
		lastUpdated: "2026-05-12",
	},
];

function toCampusDoc(s: Stub): Content.CampusDocument {
	return {
		id: `stub-${s.uid}`,
		uid: s.uid,
		url: `/campuses/${s.uid}`,
		type: "campus",
		href: "",
		tags: [],
		first_publication_date: s.lastUpdated,
		last_publication_date: s.lastUpdated,
		slugs: [s.uid],
		linked_documents: [],
		lang: "en-us",
		alternate_languages: [],
		data: {
			name: s.name,
			university: s.university,
			country: s.country,
			summary: s.summary,
			cover_image: {
				url: s.cover,
				dimensions: { width: 1600, height: 1067 },
				alt: s.name,
				copyright: null,
				edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
				id: `stub-img-${s.uid}`,
			},
			lead_ambassador: s.leadAmbassador,
			lead_ambassador_role: s.leadAmbassadorRole ?? null,
			lead_ambassador_bio: s.leadAmbassadorBio ?? null,
			lead_ambassador_photo: s.leadAmbassadorPhoto
				? {
					url: s.leadAmbassadorPhoto,
					dimensions: { width: 600, height: 600 },
					alt: s.leadAmbassador,
					copyright: null,
					edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
					id: `stub-lead-${s.uid}`,
				}
				: { url: null, dimensions: null, alt: null, copyright: null },
			lead_ambassador_socials: (s.leadAmbassadorSocials ?? []).map((soc) => ({
				platform: soc.platform,
				url: { link_type: "Web", url: soc.url, target: "_blank" },
			})),
			founded_date: s.foundedDate,
			member_count: s.memberCount,
			body: s.body.map((text) => ({
				type: "paragraph",
				text,
				spans: [],
			})),
			related_projects: (s.relatedProjects ?? []).map((p, i) => ({
				title: p.title,
				summary: p.summary,
				slug: p.slug,
				category: p.category ?? null,
				cover_image: {
					url: p.coverUrl,
					dimensions: { width: 1200, height: 800 },
					alt: p.title,
					copyright: null,
					edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
					id: `stub-rp-${s.uid}-${i}`,
				},
			})),
			testimonials: (s.testimonials ?? []).map((tst, i) => ({
				quote: tst.quote,
				name: tst.name,
				role: tst.role ?? null,
				photo: tst.photo
					? {
						url: tst.photo,
						dimensions: { width: 200, height: 200 },
						alt: tst.name,
						copyright: null,
						edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
						id: `stub-tst-${s.uid}-${i}`,
					}
					: { url: null, dimensions: null, alt: null, copyright: null },
			})),
			events: (s.events ?? []).map((e) => ({
				date: e.date,
				title: e.title,
				location: e.location ?? null,
				link: e.link
					? { link_type: "Web", url: e.link, target: "_blank" }
					: { link_type: "Any" },
			})),
			milestones: (s.milestones ?? DEFAULT_MILESTONES).map((m) => ({
				date: m.date,
				title: m.title,
				description: m.description ?? null,
			})),
			programs: (s.programs ?? DEFAULT_PROGRAMS).map((p) => ({
				name: p.name,
				description: p.description,
			})),
			gallery: s.gallery.map((g, i) => ({
				image: {
					url: g.url,
					dimensions: { width: 1200, height: 900 },
					alt: g.caption,
					copyright: null,
					edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
					id: `stub-gal-${s.uid}-${i}`,
				},
				caption: g.caption,
			})),
		},
		// biome-ignore lint/suspicious/noExplicitAny: stub cast for fields not surfaced in UI
	} as any;
}

const STUB_DOCS = STUBS.map(toCampusDoc);

function matches(doc: Content.CampusDocument, query: string) {
	const q = query.toLowerCase();
	const haystack = [
		doc.data.name,
		doc.data.university,
		doc.data.country,
		doc.data.summary,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return haystack.includes(q);
}

export function stubSearchCampuses({
	page,
	pageSize,
	query,
	country,
}: {
	page: number;
	pageSize: number;
	query?: string;
	country?: string;
}): Content.CampusDocument[] {
	const trimmed = query?.trim();
	let filtered = STUB_DOCS;
	if (country) filtered = filtered.filter((d) => d.data.country === country);
	if (trimmed) filtered = filtered.filter((d) => matches(d, trimmed));
	const start = page * pageSize;
	return filtered.slice(start, start + pageSize);
}

export function stubGetCampusCountries(): string[] {
	const set = new Set(
		STUB_DOCS.map((d) => d.data.country).filter((v): v is string => Boolean(v)),
	);
	return Array.from(set).sort();
}

export function stubGetCampusesTotal(): number {
	return STUB_DOCS.length;
}

export function stubGetCampus(uid: string): Content.CampusDocument | null {
	return STUB_DOCS.find((d) => d.uid === uid) ?? null;
}

export function stubGetCampuses(): Content.CampusDocument[] {
	return STUB_DOCS;
}
