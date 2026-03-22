export const FEATURED_POSTS = {
	"stop-the-violence-outreach": {
		title: "StopTheViolence: Akoka High School Outreach",
		cover: "/assets/blog-1.png",
		date: "2024-09-03",
		category: "Featured",
		excerpt:
			"We carried out secondary school outreaches to Akoka High School, Lagos to sensitize 700 pupils on Gender Based Violence and legal implications of violence.",
		content: `We carried out secondary school outreaches to Akoka High School, Lagos, to sensitize 700 pupils on Gender Based Violence and the legal implications of violence.

## Why This Matters

Gender-based violence remains one of the biggest challenges facing young people in Nigerian schools. Many students witness or experience violence daily but lack the language and awareness to address it.

## What We Did

Our team of volunteers and facilitators organized a full-day awareness program that included:

- **Interactive workshops** on recognizing different forms of violence
- **Role-playing sessions** where students practiced conflict resolution
- **Legal awareness talks** about the consequences of violence under Nigerian law
- **Peer support training** to equip student leaders as first responders

![Students participating in the workshop](https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80)

## Impact

Over 700 students participated across all grade levels. Post-event surveys showed:

- 89% of students reported better understanding of GBV
- 76% said they now know where to report incidents
- Student-led peace clubs were established in 3 departments

## What's Next

We plan to expand this program to 5 more schools across Lagos State in the coming quarter, with the goal of reaching 3,000+ students by year-end.
`,
	},
	"pad-a-girl-nasarawa": {
		title: "Pad-A-Girl: Nasarawa State Initiative",
		cover: "/assets/blog-1.png",
		date: "2024-09-03",
		category: "Featured",
		excerpt:
			"In Nasarawa, a number of girls are absent from school during their menstrual periods due to lack of access to sanitary products.",
		content: `In Nasarawa, a number of girls are most times absent from school during their menstrual periods due to lack of access to sanitary products. This project addresses that gap directly.

## The Problem

Menstrual hygiene remains a taboo topic in many Nigerian communities. Girls miss an average of 4-5 school days per month, leading to falling behind in coursework, lower exam scores, higher dropout rates, and social stigma.

## Our Approach

The Pad-A-Girl initiative takes a holistic approach:

- **Distribution of sanitary products** to girls in 10 secondary schools
- **Menstrual hygiene education** workshops for both boys and girls
- **Training local women** to produce reusable sanitary pads
- **Setting up pad banks** in each participating school

![Girls receiving sanitary kits](https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=80)

## Results So Far

- 500+ girls received sanitary product kits
- School attendance improved by 23% among beneficiaries
- 15 women trained in reusable pad production
- 8 school pad banks established and operational
`,
	},
	"digi-rural-oyo": {
		title: "Digi-Rural: Bridging the Digital Divide in Oyo State",
		cover: "/assets/blog-1.png",
		date: "2024-09-03",
		category: "Featured",
		excerpt:
			"Oyo state has been growing in digitalization but many rural communities remain unreached. This project impacts 100 girls in secondary schools.",
		content: `Oyo state has been growing in digitalization but many rural communities in the state remain unreached. This project will impact 100 girls in secondary schools across rural Oyo.

## The Digital Gap

While cities like Ibadan are rapidly adopting technology, rural communities face limited internet access, few computer labs in schools, no exposure to digital career paths, and cultural barriers to girls in technology.

## Program Structure

The Digi-Rural program runs over 8 weeks in each school:

### Week 1-2: Digital Literacy Basics
- Introduction to computers and the internet
- Basic typing and file management

### Week 3-4: Creative Digital Skills
- Graphic design with Canva
- Basic photo and video editing

### Week 5-6: Introduction to Coding
- Scratch programming for beginners
- Building simple websites with HTML/CSS

### Week 7-8: Career Exploration
- Careers in technology overview
- Mentorship matching with tech professionals

![Students learning to code](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80)
`,
	},
	"project-saturn": {
		title: "Project Saturn: Celebrating the Girl Child",
		cover: "/assets/blog-1.png",
		date: "2024-09-03",
		category: "Featured",
		excerpt:
			"Saturn is the most complex and unique of all the planets. This project celebrates the uniqueness and strength of the girl child across Africa.",
		content: `Saturn is the most complex and unique of all the planets. This project is called Saturn because it is designed to celebrate the uniqueness and strength of the girl child across Africa.

## The Vision

Every girl is unique — just like Saturn with its rings, each girl carries her own brilliance. Project Saturn is a continent-wide campaign to amplify the voices of young African women, showcase their achievements, build supportive communities, and challenge stereotypes.

## Key Activities

### Storytelling Campaign
We're collecting and publishing stories from girls across 10 African countries, highlighting their dreams, achievements, and the challenges they've overcome.

### Leadership Summit
An annual gathering bringing together young women leaders from across Africa for workshops, networking, and mentorship.

### Digital Gallery
An online exhibition showcasing artwork, essays, and projects created by girls in our programs.

![Young women at a leadership event](https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80)

## Get Involved

Whether you're a storyteller, artist, mentor, or sponsor — there's a role for you in Project Saturn. [Contact us](/contact-us) to learn more.
`,
	},
} as const;

export type PostSlug = keyof typeof FEATURED_POSTS;

export const POST_CATEGORIES = [
	"Featured",
	"Leadership",
	"Personal Development",
	"Community Building",
	"Career Growth",
	"Success Stories",
] as const;

export function readTime(content: string) {
	const words = content.trim().split(/\s+/).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatPostDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}
