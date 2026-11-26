import { SiteImage as Image } from "@/components/ui/site-image";

const SOURCES = {
	colour: "/assets/icons/4herfrika-logo.svg",
	white: "/assets/icons/4herfrika-logo-white.svg",
} as const;

export default function FourHerfrikaLogo({
	className,
	alt = "4HerFrika",
	tone = "colour",
}: { className?: string; alt?: string; tone?: keyof typeof SOURCES }) {
	return (
		<Image
			src={SOURCES[tone]}
			alt={alt}
			width={155}
			height={44}
			className={className}
		/>
	);
}
