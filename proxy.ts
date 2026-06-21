import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
	matcher: [
		"/((?!api|_next|_vercel|assets|favicon|reports|dashboard|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|woff|woff2|ttf|txt|xml|json|pdf)$).*)",
	],
};
