export const CURRENCIES = ["NGN", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const FREQUENCIES = ["once", "monthly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const AMOUNT_LIMITS: Record<Currency, { min: number; max: number }> = {
	NGN: { min: 1_000, max: 10_000_000 },
	USD: { min: 5, max: 10_000 },
};

export const PRESET_AMOUNTS: Record<Currency, readonly number[]> = {
	NGN: [5_000, 10_000, 25_000, 50_000],
	USD: [10, 25, 50, 100],
};

export const DEFAULT_AMOUNTS: Record<Currency, number> = {
	NGN: 10_000,
	USD: 25,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	NGN: "₦",
	USD: "$",
};

export function isFrequency(value: string): value is Frequency {
	return (FREQUENCIES as readonly string[]).includes(value);
}

const WHOLE_AMOUNT = /^\d{1,9}(\.0{1,2})?$/;

export function parseAmount(input: string): number | null {
	const cleaned = input.replace(/[₦$\s,]|NGN|USD/gi, "");
	if (!WHOLE_AMOUNT.test(cleaned)) return null;
	return Number.parseInt(cleaned, 10);
}

export function isAmountWithinLimits(
	amount: number,
	currency: Currency,
): boolean {
	const { min, max } = AMOUNT_LIMITS[currency];
	return Number.isInteger(amount) && amount >= min && amount <= max;
}

export function toMinorUnits(amount: number): number {
	return Math.round(amount * 100);
}

export function fromMinorUnits(minor: number): number {
	return minor / 100;
}

export function formatAmount(
	amount: number,
	currency: Currency,
	locale: string,
): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		currencyDisplay: "narrowSymbol",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount);
}

export function isCurrency(value: string): value is Currency {
	return (CURRENCIES as readonly string[]).includes(value);
}
