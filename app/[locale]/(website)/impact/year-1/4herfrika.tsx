import Image from "next/image";

export default function F4herfrikaLogo({ className }: { className?: string }) {
	return (
		<Image
			src="/assets/icons/4herfrika-impact.svg"
			alt="4HerFrika"
			width={1500}
			height={424}
			className={className}
		/>
	);
}
