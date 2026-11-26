export function ProjectContent({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="
        prose prose-gray max-w-none
        prose-headings:scroll-mt-24
        prose-h2:text-foreground prose-h2:font-bold prose-h2:text-[26px] lg:prose-h2:text-[32px]
        prose-h3:text-foreground prose-h3:font-bold
        prose-p:text-foreground/90 prose-p:text-[17px] prose-p:leading-[1.75]
        prose-strong:text-foreground
        prose-li:marker:text-primary-500
        prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-[20px]
      "
		>
			{children}
		</div>
	);
}
