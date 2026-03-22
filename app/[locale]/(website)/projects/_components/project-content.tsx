export function ProjectContent({ children }: { children: React.ReactNode }) {
	return (
		<article
			className="
        prose prose-gray max-w-none
        prose-headings:scroll-mt-24
        prose-h2:text-foreground prose-h2:font-extrabold
        prose-h3:text-foreground prose-h3:font-bold
        prose-p:text-foreground
        prose-strong:text-foreground
        prose-li:marker:text-foreground
        prose-a:text-pink-700 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl
      "
		>
			{children}
		</article>
	);
}
