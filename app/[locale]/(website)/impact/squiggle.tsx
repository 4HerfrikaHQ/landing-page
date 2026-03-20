import type { SVGProps } from "react";

export default function ImpactSquiggle(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 1440 589"
			{...props}
		>
			<title>Impact Squiggle</title>
			<path
				stroke="url(#impact-squiggle-grad)"
				strokeOpacity={0.6}
				strokeWidth={100}
				d="M1439.9 176.966c-226.66 0-323.42-181.573-462.9-110.446-139.373 71.072-87.218 282.217-231.35 299.916S548.051 141.344 402 176.966 218.363 538.978 0 538.978"
				opacity={0.1}
			/>
			<defs>
				<linearGradient
					id="impact-squiggle-grad"
					x1={15.5}
					x2={1459}
					y1={539}
					y2={110.5}
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#216F38" />
					<stop offset={0.549} stopColor="#216F38" stopOpacity={0.2} />
					<stop offset={1} stopColor="#216F38" stopOpacity={0.9} />
				</linearGradient>
			</defs>
		</svg>
	);
}
