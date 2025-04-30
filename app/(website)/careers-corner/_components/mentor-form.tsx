"use client";

import type React from "react";

import { useRef, useState } from "react";
import { IoMdClose, IoMdCloudUpload, IoMdDocument } from "react-icons/io";

export default function MentorForm() {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

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
				setFileError("File size exceeds 10MB limit");
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

	return (
		<div className="container max-w-3xl mx-auto py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
			<h1 className="text-4xl font-bold text-center mb-2">
				Wanna Become A Mentor?
			</h1>
			<p className="text-gray-600 text-center mb-8">
				Share your purpose for becoming a mentor and take the first step with us
			</p>
			<form className="space-y-10">
				<div>
					<input
						type="text"
						placeholder="Tell us why you want to become a mentor..."
						className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-400"
					/>
				</div>

				<div>
					<input
						type="text"
						placeholder="Occupation/Tech Stack"
						className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-400"
					/>
				</div>

				<div>
					<input
						type="text"
						placeholder="Contact"
						className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-400"
					/>
				</div>

				<div>
					<input
						type="email"
						placeholder="email@gmail"
						value={email}
						onChange={handleEmailChange}
						className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-400"
					/>
					{emailError && (
						<p className="text-pink-500 text-sm mt-1">
							Please, enter valid email address
						</p>
					)}
				</div>

				<div>
					<input
						type="text"
						placeholder="Linkedin"
						className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-500 placeholder:text-gray-400"
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
							role="button"
							tabIndex={0}
							className="border border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
						>
							<IoMdCloudUpload className="h-6 w-6 text-gray-400 mb-2" />
							<p className="text-gray-400">Upload a Professional Headshot</p>
						</div>
					) : (
						<div className="border border-gray-200 rounded p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<IoMdDocument className="h-5 w-5 text-gray-400" />
									<span className="text-sm text-gray-400 truncate max-w-[250px]">
										{file.name}
									</span>
								</div>
								<button
									type="button"
									onClick={removeFile}
									className="text-gray-400 hover:text-gray-700"
								>
									<IoMdClose className="h-5 w-5" />
								</button>
							</div>
						</div>
					)}

					{fileError && (
						<p className="text-pink-500 text-sm mt-1">{fileError}</p>
					)}
				</div>

				<p className="text-gray-400 text-xs">
					Attach file. File size of your documents should not exceed 10MB
				</p>

				<div className="flex items-start">
					<input type="checkbox" id="updates" className="mt-1 mr-2" />
					<label htmlFor="updates" className="text-gray-400">
						I would like to receive updates and tips on mentoring from
						4HerFrika.
					</label>
				</div>

				<button
					type="submit"
					className="w-full bg-pink-500 text-white py-3 rounded font-medium hover:bg-pink-600 transition-colors"
				>
					SUBMIT
				</button>
			</form>{" "}
		</div>
	);
}
