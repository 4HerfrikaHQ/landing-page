const HIDDEN_PAGES = ["/donate", "/impact/two-steps-forward"];
const HIDDEN_SECTIONS = ["/careercorner/", "/academy/"];

export function isBannerHidden(pathname: string) {
	return (
		HIDDEN_PAGES.some((path) => pathname.startsWith(path)) ||
		HIDDEN_SECTIONS.some((prefix) => pathname.startsWith(prefix))
	);
}
