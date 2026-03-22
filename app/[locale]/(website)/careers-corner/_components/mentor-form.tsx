"use client";

import type React from "react";

import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

export default function MentorForm() {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations("careers");
	const tc = useTranslations("common");

	const validateEmail = (email: string) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		setEmailError(!validateEmail(e.target.value) && e.target.value !== "");
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0] || null;

		if (selectedFile) {
			// Check file size (10MB = 10 * 1024 * 1024 bytes)
			if (selectedFile.size > 10 * 1024 * 1024) {
				setFileError(t("fileSizeError"));
				setFile(null);
				return;
			}

			setFile(selectedFile);
			setFileError("");
		}
	};

	const handleFileClick = () => {
		fileInputRef.current?.click();
	};

	const removeFile = () => {
		setFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			handleFileClick();
		}
	};

	const inputClassName =
		"h-auto rounded-none border-0 border-b border-border px-0 py-2 focus-visible:border-border focus-visible:ring-0 placeholder:text-muted-foreground";

	return (
		<FadeIn>
		<div className="container max-w-3xl mx-auto py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
			<h1 className="text-4xl font-bold text-center mb-2">
				{t("becomeMentor")}
			</h1>
			<p className="text-muted-foreground text-center mb-8">
				{t("becomeMentorDescription")}
			</p>
			<form className="space-y-10">
				<div>
					<Input
						type="text"
						placeholder={t("whyMentor")}
						className={inputClassName}
					/>
				</div>

				<div>
					<Input
						type="text"
						placeholder={t("occupation")}
						className={inputClassName}
					/>
				</div>

				<div>
					<Input type="text" placeholder={t("contactField")} className={inputClassName} />
				</div>

				<div>
					<Input
						type="email"
						placeholder={t("emailPlaceholder")}
						value={email}
						onChange={handleEmailChange}
						className={inputClassName}
					/>
					{emailError && (
						<p className="text-pink-500 text-sm mt-1">
							{t("invalidEmail")}
						</p>
					)}
				</div>

				<div>
					<Input
						type="text"
						placeholder={t("linkedin")}
						className={inputClassName}
					/>
				</div>

				<div>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="hidden"
						accept="image/*"
					/>

					{!file ? (
						<div
							onClick={handleFileClick}
							onKeyDown={handleKeyPress}
							// biome-ignore lint/a11y/useSemanticElements: <explanation>
							role="button"
							tabIndex={0}
							className="border border-dashed border-border rounded p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
						>
							<Upload className="h-6 w-6 text-foreground mb-2" />
							<p className="text-foreground">{t("uploadHeadshot")}</p>
						</div>
					) : (
						<div className="border border-border rounded p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<FileText className="h-5 w-5 text-foreground" />
									<span className="text-sm text-foreground truncate max-w-62.5">
										{file.name}
									</span>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={removeFile}
									className="text-foreground hover:text-foreground"
								>
									<X className="h-5 w-5" />
								</Button>
							</div>
						</div>
					)}

					{fileError && (
						<p className="text-pink-500 text-sm mt-1">{fileError}</p>
					)}
				</div>

				<p className="text-foreground text-xs">
					{t("attachFile")}
				</p>

				<div className="flex items-start">
					<input type="checkbox" id="updates" className="mt-1 mr-2" />
					<Label htmlFor="updates" className="text-foreground font-normal">
						{t("receiveUpdates")}
					</Label>
				</div>

				<Button
					type="submit"
					className="w-full bg-pink-500 text-white py-3 rounded font-medium hover:bg-pink-600 transition-colors"
				>
					{tc("submit")}
				</Button>
			</form>{" "}
		</div>
		</FadeIn>
	);
}
