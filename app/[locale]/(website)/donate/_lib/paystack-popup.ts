const INLINE_JS_URL = "https://js.paystack.co/v2/inline.js";

export type PopupCallbacks = {
	onSuccess: (transaction: { reference: string }) => void;
	onCancel: () => void;
	onError: (error: { message: string }) => void;
};

type PaystackPopInstance = {
	resumeTransaction: (accessCode: string, callbacks: PopupCallbacks) => unknown;
};

type PaystackPopConstructor = new () => PaystackPopInstance;

type PaystackWindow = Window & { PaystackPop?: PaystackPopConstructor };

let loading: Promise<PaystackPopConstructor> | null = null;

function injectScript(): Promise<PaystackPopConstructor> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = INLINE_JS_URL;
		script.async = true;
		script.onload = () => {
			const pop = (window as PaystackWindow).PaystackPop;
			if (pop) resolve(pop);
			else reject(new Error("Paystack did not load"));
		};
		script.onerror = () => reject(new Error("Paystack could not be reached"));
		document.head.appendChild(script);
	});
}

export function loadPaystackPop(): Promise<PaystackPopConstructor> {
	const existing = (window as PaystackWindow).PaystackPop;
	if (existing) return Promise.resolve(existing);
	loading ??= injectScript().catch((error) => {
		loading = null;
		throw error;
	});
	return loading;
}

export async function openPaystackPopup(
	accessCode: string,
	callbacks: PopupCallbacks,
): Promise<void> {
	const PaystackPop = await loadPaystackPop();
	new PaystackPop().resumeTransaction(accessCode, callbacks);
}
