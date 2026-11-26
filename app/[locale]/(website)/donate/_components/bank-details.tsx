"use client";

import { Link } from "@/i18n/navigation";
import { Check, ClipboardCopy, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const COPIED_RESET_MS = 1_600;

const VALUE_CLASS = {
	big: "whitespace-nowrap text-2xl font-semibold tracking-wide sm:text-[28px] sm:tracking-wider",
	regular: "break-words text-[15px] font-medium leading-snug",
} as const;

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
	const valueClass = big ? VALUE_CLASS.big : VALUE_CLASS.regular;
	const isCopied = copied === field;
	const announcement = isCopied ? t("copied") : "";
	return (
		<div>
			<dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-1 flex items-center gap-3">
				<span className={`${valueClass} font-mono tabular-nums`}>{value}</span>
				<button
					type="button"
					onClick={() => onCopy(value, field)}
					className="press ml-auto inline-flex h-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-white px-3 text-sm min-[380px]:px-4 font-medium outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-primary-500"
				>
					<span className="grid">
						<span
							data-visible={!isCopied}
							className="col-start-1 row-start-1 inline-flex items-center gap-1.5 data-[visible=false]:invisible"
						>
							<ClipboardCopy className="size-4" aria-hidden="true" />
							<span className="max-[379px]:sr-only">{t("copy")}</span>
						</span>
						<span
							aria-hidden="true"
							data-visible={isCopied}
							className="col-start-1 row-start-1 inline-flex items-center gap-1.5 data-[visible=false]:invisible"
						>
							<Check className="size-4 text-green-700" aria-hidden="true" />
							<span className="max-[379px]:sr-only">{t("copied")}</span>
						</span>
					</span>
					<span className="sr-only">{label}</span>
				</button>
				<output className="sr-only">{announcement}</output>
			</dd>
		</div>
	);
}

export default function BankDetails({ online }: { online: boolean }) {
	const [copied, setCopied] = useState("");
	const t = useTranslations("donate");
	const title = t(online ? "bank.titleOnline" : "bank.titleOffline");
	const monthlyText = t(online ? "bank.monthlyText" : "bank.monthlySoon");

	const copy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(field);
			setTimeout(() => setCopied(""), COPIED_RESET_MS);
		} catch {}
	};

	return (
		<div id="bank-details" className="flex flex-col">
			<h3 className="text-sm font-semibold">{title}</h3>
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
				<b>{t("bank.monthlyLabel")}</b> {monthlyText}
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
