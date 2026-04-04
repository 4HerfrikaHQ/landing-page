"use client";

import { AvailabilityEditor } from "@/components/availability-editor";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { logout } from "@/src/auth";
import type { DbUser } from "@/src/db/schema/tables";
import { CameraIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { getMentorProfile, updateMyProfile, uploadMyImage } from "../_actions";
import { DbMentorWithAvailability } from "@/src/db/schema/tables"

type Tab = "profile" | "availability";

export function MentorProfile({ user, mentor: dbMentor }: { user: DbUser; mentor: DbMentorWithAvailability }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

	const [fields, setFields] = useState({
		name: dbMentor.name,
		position: dbMentor.position ?? "",
		nickname: dbMentor.nickname ?? "",
		bio: dbMentor.bio ?? "",
		linkedin_url: dbMentor.linkedin_url ?? "",
	});

  const [preview, setPreview] = useState<string | null>(dbMentor.image);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isSigningOut, startSignOutTransition] = useTransition();
	const [isUploading, startUploadTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync controlled state when the server re-renders with fresh data after revalidatePath
	useEffect(() => {
		setFields({
			name: dbMentor.name,
			position: dbMentor.position ?? "",
			nickname: dbMentor.nickname ?? "",
			bio: dbMentor.bio ?? "",
			linkedin_url: dbMentor.linkedin_url ?? "",
		});
	}, [dbMentor]);

	const firstName = user.name.split(" ")[0];
	const initials = fields.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 4 * 1024 * 1024) { alert("Image must be under 4MB."); return; }
		setPreview(URL.createObjectURL(file));
		const formData = new FormData();
		formData.append("file", file);
		startUploadTransition(async () => {
			try {
				const result = await uploadMyImage(formData);
				if (result.error) { setPreview(dbMentor.image); alert(`Upload failed: ${result.error}`); }
				else if (result.url) setPreview(result.url);
			} catch (err) {
				setPreview(dbMentor.image);
				alert(`Upload failed: ${String(err)}`);
			}
		});
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		startTransition(async () => {
			const result = await updateMyProfile(new FormData(e.currentTarget));
			if (result.error) setError(result.error);
		});
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="sticky top-0 z-10 flex items-center justify-between h-11 px-8 border-b bg-white/90 backdrop-blur-sm">
				<span className="text-sm font-medium text-gray-400">Mentor Portal</span>
				<button
					onClick={() => startSignOutTransition(async () => { await logout(); })}
					disabled={isSigningOut}
					className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
				>
					{isSigningOut ? "Signing out…" : "Sign out"}
				</button>
			</header>

			<div className="p-8 max-w-3xl mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-semibold text-gray-900">Hi, {firstName} 👋</h1>
					<p className="text-sm text-gray-500 mt-1">Manage your profile.</p>
				</div>

				<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
					{(["profile", "availability"] as Tab[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setActiveTab(t)}
							className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
						>
							{t}
						</button>
					))}
				</div>

				{activeTab === "profile" ? (
					<>
						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							<div className="flex items-center gap-4 mb-2">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="group relative size-20 rounded-full overflow-hidden cursor-pointer shrink-0"
								>
									{preview ? (
										<Image src={preview} alt={fields.name} fill className="object-cover object-top" sizes="80px" unoptimized />
									) : (
										<span className="flex size-full items-center justify-center bg-gray-100 text-gray-500 text-lg font-medium">{initials}</span>
									)}
									<span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
										{isUploading ? <Loader2Icon className="size-5 text-white animate-spin" /> : <CameraIcon className="size-5 text-white" />}
									</span>
								</button>
								<div>
									<p className="text-sm font-medium text-gray-700">{fields.name}</p>
									<p className="text-xs text-gray-400">Click photo to update</p>
								</div>
							</div>
							<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />

							<Field label="Name" name="name" required value={fields.name} onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))} />
							<Field label="Position" name="position" value={fields.position} onChange={(e) => setFields((f) => ({ ...f, position: e.target.value }))} />
							<Field label="Nickname" name="nickname" value={fields.nickname} onChange={(e) => setFields((f) => ({ ...f, nickname: e.target.value }))} />

							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</label>
								<Textarea name="bio" rows={4} className="text-sm resize-none" placeholder="Short bio…" value={fields.bio} onChange={(e) => setFields((f) => ({ ...f, bio: e.target.value }))} />
							</div>

							<Field label="LinkedIn URL" name="linkedin_url" type="url" value={fields.linkedin_url} onChange={(e) => setFields((f) => ({ ...f, linkedin_url: e.target.value }))} />

							{error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>}

							<div className="flex justify-end">
								<Button type="submit" variant="solid" size="sm" disabled={isPending}>
									{isPending ? "Saving…" : "Save changes"}
								</Button>
							</div>
						</form>
					</>
				) : (
					<AvailabilityEditor mentorId={dbMentor.id} initialSlots={dbMentor.availability} />
				)}
			</div>
		</div>
	);
}
