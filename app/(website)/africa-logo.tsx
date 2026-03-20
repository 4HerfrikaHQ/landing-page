export default function AfricaLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src="/assets/icons/africa-logo.svg"
			alt="Africa"
			className={className}
			{...props}
		/>
	);
}
