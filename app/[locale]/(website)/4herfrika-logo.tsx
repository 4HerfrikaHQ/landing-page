import Image from "next/image";

export default function FourHerfrikaLogo({
	className,
	alt = "4HerFrika",
}: { className?: string; alt?: string }) {
	return (
		<Image
			src="/assets/icons/4herfrika-logo.svg"
			alt={alt}
			width={155}
			height={44}
			className={className}
		/>
	);
}
