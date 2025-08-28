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

				{/* Copy button adapts to mobile */}
				<button
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
						<span className="inline-flex items-center gap-1.5">
							<svg
								className="w-4 h-4"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							Copied
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5">
							<svg
								className="w-4 h-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							Copy
						</span>
					)}
				</button>
			</div>
		</div>
	);
}

type BankDetailsProps = {
	accountNumber?: string;
	beneficiaryName?: string;
	sortCode?: string;
	iban?: string;
	swift?: string;
};

export default function BankDetails({
	accountNumber = "0000000000",
	beneficiaryName = "4HerAfrika",
	sortCode = "OW17B7F3D",
	iban,
	swift,
}: BankDetailsProps) {
	const [copied, setCopied] = useState("");

	const copy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(field);
			setTimeout(() => setCopied(""), 1600);
		} catch {}
	};

	return (
		<div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
			{/* Header */}
			<div className="px-5 sm:px-8 md:px-10 py-5 sm:py-6 border-b border-gray-200 bg-gray-50">
				<div className="flex items-center gap-3 sm:gap-4">
					<div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl sm:rounded-2xl">
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
							Direct Bank Transfer
						</h3>
						<p className="text-gray-600 text-xs sm:text-sm">
							Make your donation directly to our account
						</p>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="bg-white px-5 sm:px-8 md:px-10 py-8 sm:py-10">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-10">
					{/* Left column */}
					<div className="lg:col-span-3 space-y-6 sm:space-y-8">
						<CopyRow
							label="Account Number"
							value={accountNumber}
							field="account"
							big
							onCopy={copy}
							copied={copied}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
							<CopyRow
								label="Beneficiary Name"
								value={beneficiaryName}
								field="beneficiary"
								onCopy={copy}
								copied={copied}
							/>
							<CopyRow
								label="Sort Code / IFSC"
								value={sortCode}
								field="sortcode"
								onCopy={copy}
								copied={copied}
							/>
						</div>

						{(iban || swift) && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
								{iban && (
									<CopyRow
										label="IBAN"
										value={iban}
										field="iban"
										onCopy={copy}
										copied={copied}
									/>
								)}
								{swift && (
									<CopyRow
										label="SWIFT / BIC"
										value={swift}
										field="swift"
										onCopy={copy}
										copied={copied}
									/>
								)}
							</div>
						)}
					</div>

					{/* Right column */}
					<div className="lg:col-span-2">
						<div className="rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-6 bg-gray-50">
							<h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
								Ready to make a difference?
							</h4>
							<p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6">
								Use the account details to make your donation. If you include a
								reference, please use{" "}
								<span className="font-semibold">“4HERFRIKA DONATION”</span>.
							</p>

							<div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-700">
								<div className="flex items-center gap-2">
									<span className="inline-block w-2 h-2 rounded-full bg-pink-500"></span>
									Secure bank transfer
								</div>
								<div className="flex items-center gap-2">
									<span className="inline-block w-2 h-2 rounded-full bg-purple-600"></span>
									Funds go directly to programs
								</div>
								<div className="flex items-center gap-2">
									<span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
									Receipts available on request
								</div>
							</div>

							<div className="mt-5 sm:mt-6">
								<a
									href="#"
									className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg sm:rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
								>
									Download bank details (PDF)
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Footer strip */}
				<div className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-4 sm:p-5 border border-gray-200">
					<p className="text-xs sm:text-sm text-gray-600 text-center">
						Thank you for supporting 4HERFRIKA. Every donation helps us reach
						more women and girls with life-changing opportunities.
					</p>
				</div>
			</div>
		</div>
	);
}
