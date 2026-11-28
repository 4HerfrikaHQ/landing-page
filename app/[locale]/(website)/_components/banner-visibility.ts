const BANNER_ENDS_AT = Date.parse("2027-01-01T00:00:00+01:00");

const HIDDEN_PAGES = ["/donate", "/impact/two-steps-forward"];
const HIDDEN_SECTIONS = ["/careercorner/", "/academy/"];

export function isBannerHidden(pathname: string) {
	return (
		HIDDEN_PAGES.some((path) => pathname.startsWith(path)) ||
		HIDDEN_SECTIONS.some((prefix) => pathname.startsWith(prefix))
	);
}

export function isBannerExpired(now: number) {
	return now >= BANNER_ENDS_AT;
}
