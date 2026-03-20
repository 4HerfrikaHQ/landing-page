import Image from "next/image";

export default function AfricaLogo({ className }: { className?: string }) {
	return (
		<Image
			src="/assets/icons/africa-logo.svg"
			alt="Africa"
			width={271}
			height={240}
			className={className}
		/>
	);
}
