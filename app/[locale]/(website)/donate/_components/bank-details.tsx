"use client";

import { Button } from "@/components/ui/button";
import { Check, ClipboardCopy, Landmark } from "lucide-react";
import { useState } from "react";

function CopyRow({
	label,
	value,
	field,
	big,
	onCopy,
	copied,
}: {
	label: string;
	value: string;
	field: string;
	big?: boolean;
	onCopy: (text: string, field: string) => void;
	copied: string;
}) {
	return (
		<div className="group">
			<p className="text-[11px] sm:text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
				{label}
			</p>
			<div className="flex items-center gap-2">
				<span
					className={`${
						big
							? "text-xl sm:text-2xl font-semibold tracking-wider"
							: "text-sm sm:text-base font-medium tracking-wide"
					} text-foreground font-mono break-all`}
				>
					{value}
				</span>

				<Button
					variant="outline"
					size="sm"
					className="ml-auto"
					onClick={() => onCopy(value, field)}
				>
					{copied === field ? (
						<>
							<Check className="h-3.5 w-3.5 text-green-600" />
							Copied
						</>
					) : (
						<>
							<ClipboardCopy className="h-3.5 w-3.5" />
							Copy
						</>
					)}
				</Button>
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
		<div className="rounded-2xl overflow-hidden border border-border shadow-sm">
			<div className="px-6 py-5 border-b border-border bg-muted flex items-center gap-3">
				<div className="inline-flex items-center justify-center w-10 h-10 bg-accent rounded-xl">
					<Landmark className="h-5 w-5 text-muted-foreground" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-foreground">Providus Bank</h3>
					<p className="text-muted-foreground text-xs sm:text-sm">
						Use the account details below to make your transfer
					</p>
				</div>
			</div>

			<div className="bg-background px-6 py-8 space-y-6">
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

			<div className="bg-linear-to-r from-muted via-white to-muted px-6 py-4 border-t border-border">
				<p className="text-xs sm:text-sm text-muted-foreground text-center">
					Thank you for your support. Every contribution helps us make a bigger
					impact.
				</p>
			</div>
		</div>
	);
}
