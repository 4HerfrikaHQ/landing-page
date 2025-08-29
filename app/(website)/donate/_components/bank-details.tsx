"use client";

import React, { useState } from "react";

type CopyRowProps = {
	label: string;
	value: string;
	field: string;
	big?: boolean;
	onCopy: (text: string, field: string) => void;
	copied: string;
};

function CopyRow({ label, value, field, big, onCopy, copied }: CopyRowProps) {
	return (
		<div className="group">
			<label className="block text-[11px] sm:text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
				{label}
			</label>
			<div className="flex items-center gap-2">
				<span
					className={`${
						big
							? "text-xl sm:text-2xl font-semibold tracking-wider"
							: "text-sm sm:text-base font-medium tracking-wide"
					} text-gray-900 font-mono break-all`}
				>
					{value}
				</span>

				<button
					type="button"
					onClick={() => onCopy(value, field)}
					className={`ml-auto inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs sm:text-sm transition-all
            ${
							copied === field
								? "border-green-200 bg-green-50 text-green-700"
								: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:scale-95"
						}`}
					aria-label={`Copy ${label}`}
					title={`Copy ${label}`}
				>
					{copied === field ? (
						<span className="inline-flex items-center gap-1.5">✅ Copied</span>
					) : (
						<span className="inline-flex items-center gap-1.5">📋 Copy</span>
					)}
				</button>
			</div>
		</div>
	);
}

export default function BankDetails() {
	const [copied, setCopied] = useState("");

	const copy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(field);
			setTimeout(() => setCopied(""), 1600);
		} catch {}
	};

	return (
		<div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
			{/* Header */}
			<div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
				<div className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 rounded-xl">
					🏦
				</div>
				<div>
					<h3 className="text-xl font-bold text-gray-900">Providus Bank</h3>
					<p className="text-gray-600 text-xs sm:text-sm">
						Use the account details below to make your transfer
					</p>
				</div>
			</div>

			<div className="bg-white px-6 py-8 space-y-6">
				<CopyRow
					label="Account Number"
					value="6506487134"
					field="account"
					big
					onCopy={copy}
					copied={copied}
				/>
				<CopyRow
					label="Account Name"
					value="Ademide Adedamola"
					field="name"
					onCopy={copy}
					copied={copied}
				/>
			</div>

			{/* Footer strip */}
			<div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-4 border-t border-gray-200">
				<p className="text-xs sm:text-sm text-gray-600 text-center">
					Thank you for your support ❤️ Every contribution helps us make a bigger
					impact.
				</p>
			</div>
		</div>
	);
}
