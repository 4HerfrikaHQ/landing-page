export function formatSlotWhen(startUtc: string, locale: string, tz: string) {
	return new Intl.DateTimeFormat(locale, {
		weekday: "long",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		timeZone: tz,
		timeZoneName: "short",
	}).format(new Date(startUtc));
}

export function formatSlotTime(startUtc: string, locale: string, tz: string) {
	return new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		timeZone: tz,
	}).format(new Date(startUtc));
}

export function formatDayParts(date: Date, locale: string, tz: string) {
	return {
		weekday: new Intl.DateTimeFormat(locale, {
			weekday: "short",
			timeZone: tz,
		}).format(date),
		day: new Intl.DateTimeFormat(locale, {
			day: "numeric",
			timeZone: tz,
		}).format(date),
		long: new Intl.DateTimeFormat(locale, {
			weekday: "long",
			day: "numeric",
			month: "long",
			timeZone: tz,
		}).format(date),
	};
}

export function formatWeekRange(start: Date, end: Date, locale: string) {
	return {
		start: new Intl.DateTimeFormat(locale, {
			day: "numeric",
			month: "short",
		}).format(start),
		end: new Intl.DateTimeFormat(locale, {
			day: "numeric",
			month: "short",
			year: "numeric",
		}).format(end),
	};
}
