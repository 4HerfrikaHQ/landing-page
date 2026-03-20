import Image from "next/image";

export default function FourHerfrikaLogo({ className }: { className?: string }) {
	return (
		<Image
			src="/assets/icons/4herfrika-logo.svg"
			alt="4HerFrika"
			width={155}
			height={44}
			className={className}
		/>
	);
}
