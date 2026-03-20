import type { SVGProps } from "react";

export default function FourHerfrikaLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src="/assets/icons/4herfrika-logo.svg"
			alt="4HerFrika"
			className={className}
			{...props}
		/>
	);
}
