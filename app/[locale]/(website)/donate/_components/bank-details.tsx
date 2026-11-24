"use client";

import { Link } from "@/i18n/navigation";
import { Check, ClipboardCopy, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
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
	const t = useTranslations("donate");
	return (
		<div>
			<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-1 flex items-center gap-3">
				<span
					className={`${
						big
							? "break-all text-[28px] font-semibold tracking-wider"
							: "break-words text-[15px] font-medium leading-snug"
					} font-mono tabular-nums`}
				>
					{value}
				</span>
				<button
					type="button"
					onClick={() => onCopy(value, field)}
					className="ml-auto inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-medium outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-primary-500"
				>
					<span aria-live="polite" className="inline-flex items-center gap-1.5">
						{copied === field ? (
							<>
								<Check className="size-4 text-green-700" aria-hidden="true" />
								{t("copied")}
							</>
						) : (
							<>
								<ClipboardCopy className="size-4" aria-hidden="true" />
								{t("copy")}
							</>
						)}
					</span>
					<span className="sr-only">{label}</span>
				</button>
			</dd>
		</div>
	);
}

export default function BankDetails({ online }: { online: boolean }) {
	const [copied, setCopied] = useState("");
	const t = useTranslations("donate");

	const copy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(field);
			setTimeout(() => setCopied(""), 1600);
		} catch {}
	};

	return (
		<div id="bank-details" className="flex flex-col">
			<h3 className="text-sm font-semibold">
				{t(online ? "bank.titleOnline" : "bank.titleOffline")}
			</h3>
			<div className="mt-4 flex items-center gap-3">
				<span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
					<Landmark className="size-5" aria-hidden="true" />
				</span>
				<div>
					<p className="text-lg font-bold">{t("bankName")}</p>
					<p className="text-sm text-muted-foreground">
						{t("bankTransferNote")}
					</p>
				</div>
			</div>
			<dl className="mt-5 grid gap-4 rounded-[20px] bg-muted p-4">
				<CopyRow
					label={t("accountNumber")}
					value="1312053588"
					field="account"
					big
					onCopy={copy}
					copied={copied}
				/>
				<div className="border-t border-border pt-4">
					<CopyRow
						label={t("accountName")}
						value="4HERFRIKA YOUTH EMPOWERMENT INITIATIVE"
						field="name"
						onCopy={copy}
						copied={copied}
					/>
				</div>
			</dl>
			<p className="mt-4 text-[15px] leading-relaxed">
				<b>{t("bank.monthlyLabel")}</b>{" "}
				{t(online ? "bank.monthlyText" : "bank.monthlySoon")}
			</p>
			<p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
				{t("bank.afterTransfer")}
			</p>
			<p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
				{t.rich("bank.abroad", {
					link: (chunks) => (
						<Link
							href="/contact-us"
							className="font-medium text-primary-500 underline underline-offset-4"
						>
							{chunks}
						</Link>
					),
				})}
			</p>
			<p className="mt-auto pt-5 text-sm text-muted-foreground">
				{t("thankYou")}
			</p>
		</div>
	);
}
