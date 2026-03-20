export default function F4herfrikaLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src="/assets/icons/4herfrika-impact.svg"
			alt="4HerFrika"
			className={className}
			{...props}
		/>
	);
}
