import type { Currency } from "./amounts";
import { toMinorUnits } from "./amounts";

const RATE_PER_THOUSAND = 15;
const FLAT_FEE_MINOR = 10_000;
const FLAT_FEE_WAIVED_BELOW_MINOR = 250_000;
const FEE_CAP_MINOR = 200_000;

export function paystackLocalFeeMinor(chargeMinor: number): number {
	const percentage = Math.ceil((chargeMinor * RATE_PER_THOUSAND) / 1000);
	const flat = chargeMinor >= FLAT_FEE_WAIVED_BELOW_MINOR ? FLAT_FEE_MINOR : 0;
	return Math.min(percentage + flat, FEE_CAP_MINOR);
}

export function netAfterFeeMinor(chargeMinor: number): number {
	return chargeMinor - paystackLocalFeeMinor(chargeMinor);
}

export function grossUpForFeeMinor(netMinor: number): number {
	let gross = Math.ceil((netMinor * 1000) / (1000 - RATE_PER_THOUSAND));
	if (gross >= FLAT_FEE_WAIVED_BELOW_MINOR) {
		gross = Math.ceil(
			((netMinor + FLAT_FEE_MINOR) * 1000) / (1000 - RATE_PER_THOUSAND),
		);
	}
	if (paystackLocalFeeMinor(gross) >= FEE_CAP_MINOR) {
		gross = netMinor + FEE_CAP_MINOR;
	}
	gross = Math.ceil(gross / 100) * 100;
	while (netAfterFeeMinor(gross) < netMinor) gross += 100;
	return gross;
}

export function canCoverFee(currency: Currency): boolean {
	return currency === "NGN";
}

export type ChargeBreakdown = {
	chargeMinor: number;
	feeMinor: number;
};

export function chargeFor(
	amount: number,
	currency: Currency,
	coverFee: boolean,
): ChargeBreakdown {
	const netMinor = toMinorUnits(amount);
	if (!coverFee || !canCoverFee(currency)) {
		return { chargeMinor: netMinor, feeMinor: 0 };
	}
	const chargeMinor = grossUpForFeeMinor(netMinor);
	return { chargeMinor, feeMinor: chargeMinor - netMinor };
}
