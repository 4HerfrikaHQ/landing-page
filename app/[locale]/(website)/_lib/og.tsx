import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type CareerCornerMentor = {
	image: string;
	name: string;
};

async function imageDataUri(imageUrl?: string): Promise<string | undefined> {
	if (!imageUrl) return undefined;

	try {
		if (imageUrl.startsWith("/")) {
			const image = await readFile(join(process.cwd(), "public", imageUrl));
			const extension = extname(imageUrl).toLowerCase();
			const mimeType = extension === ".jpg" || extension === ".jpeg"
				? "image/jpeg"
				: extension === ".webp"
					? "image/webp"
					: "image/png";
			return `data:${mimeType};base64,${image.toString("base64")}`;
		}

		const response = await fetch(imageUrl, {
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return undefined;
		const contentType = response.headers.get("content-type")?.split(";")[0];
		if (!contentType?.startsWith("image/")) return undefined;
		const image = Buffer.from(await response.arrayBuffer());
		return `data:${contentType};base64,${image.toString("base64")}`;
	} catch {
		return undefined;
	}
}

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export async function generateCareerCornerOGImage(options: {
	title: string;
	subtitle?: string;
	mentorImage?: string;
	mentorName?: string;
	mentors?: CareerCornerMentor[];
}) {
	const logoData = await readFile(
		join(process.cwd(), "public/assets/nameless-logo.png"),
	);
	const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
	const mentorName = options.mentorName ?? "Career Corner";
	const primaryImage = await imageDataUri(options.mentorImage);
	const directoryImages = options.mentors
		? await Promise.all(options.mentors.slice(0, 4).map((mentor) => imageDataUri(mentor.image)))
		: [];

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "#03065c",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "10px",
					background: "linear-gradient(90deg, #ec008c 0%, #ff9edb 100%)",
					display: "flex",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: "-180px",
					right: "-80px",
					width: "650px",
					height: "650px",
					borderRadius: "50%",
					background: "#181b73",
					display: "flex",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "-230px",
					left: "-100px",
					width: "500px",
					height: "500px",
					borderRadius: "50%",
					border: "2px solid rgba(255,255,255,0.12)",
					display: "flex",
				}}
			/>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "62px 0 48px 78px",
					width: "62%",
					zIndex: 2,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<img src={logoBase64} width={38} height={56} alt="" />
					<span
						style={{
							fontSize: "27px",
							fontWeight: 700,
							color: "#ff8dcd",
						}}
					>
						4Herfrika
					</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
					<span
						style={{
							fontSize: "18px",
							fontWeight: 700,
							letterSpacing: "4px",
							color: "#ff8dcd",
						}}
					>
						CAREER CORNER
					</span>
					<div
						style={{
							fontSize: options.title.length > 52 ? "39px" : "46px",
							fontWeight: 700,
							lineHeight: 1.08,
							color: "#ffffff",
							maxWidth: "640px",
						}}
					>
						{options.title}
					</div>
					{options.subtitle && (
						<div
							style={{
								fontSize: "22px",
								lineHeight: 1.35,
								color: "#d9daf3",
								maxWidth: "590px",
							}}
						>
							{options.subtitle}
						</div>
					)}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							background: "#ec008c",
							borderRadius: "999px",
							padding: "11px 19px",
							fontSize: "18px",
							fontWeight: 600,
							color: "white",
							width: "fit-content",
						}}
					>
						Free 30-minute mentorship call
					</div>
				</div>
				<div
					style={{
						fontSize: "18px",
						color: "#ff8dcd",
						display: "flex",
					}}
				>
					4herfrika.org/careercorner
				</div>
			</div>

			<div
				style={{
					width: "38%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 2,
				}}
			>
				{primaryImage ? (
					<div
						style={{
							width: "300px",
							height: "390px",
							borderRadius: "150px 150px 36px 36px",
							border: "10px solid #ff8dcd",
							background: "#ffffff",
							overflow: "hidden",
							display: "flex",
						}}
					>
						<img
							src={primaryImage}
							alt={mentorName}
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
						/>
					</div>
				) : directoryImages.length > 0 ? (
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "18px",
							width: "340px",
						}}
					>
						{directoryImages.map((image, index) => (
							<div
								key={index}
								style={{
									width: "148px",
									height: "148px",
									borderRadius: "50%",
									border: "6px solid #ff8dcd",
									background: "#ffffff",
									overflow: "hidden",
									display: "flex",
								}}
							>
								{image ? (
									<img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
								) : (
									<div style={{ color: "#03065c", fontSize: "38px", fontWeight: 700, display: "flex" }}>
										{initials(options.mentors?.[index]?.name ?? "4H")}
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div
						style={{
							width: "300px",
							height: "390px",
							borderRadius: "150px 150px 36px 36px",
							border: "10px solid #ff8dcd",
							background: "#ffffff",
							color: "#03065c",
							fontSize: "72px",
							fontWeight: 700,
							alignItems: "center",
							justifyContent: "center",
							display: "flex",
						}}
					>
						{initials(mentorName)}
					</div>
				)}
			</div>
		</div>,
		size,
	);
}

export async function generateOGImage(title: string, subtitle?: string) {
	const logoData = await readFile(
		join(process.cwd(), "public/assets/nameless-logo.png"),
	);
	const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "flex-start",
				padding: "60px 80px",
				backgroundColor: "#ffffff",
				fontFamily: "sans-serif",
			}}
		>
			{/* Pink accent bar at top */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "6px",
					background: "linear-gradient(90deg, #ec008c 0%, #f500c9 100%)",
					display: "flex",
				}}
			/>

			{/* Soft pink background glow */}
			<div
				style={{
					position: "absolute",
					top: "-100px",
					right: "-100px",
					width: "500px",
					height: "500px",
					borderRadius: "50%",
					background: "#FFF4FC",
					display: "flex",
				}}
			/>

			{/* Logo watermark */}
			<img
				src={logoBase64}
				width={180}
				height={260}
				style={{
					position: "absolute",
					right: "60px",
					bottom: "40px",
					opacity: 0.08,
				}}
				alt=""
			/>

			{/* Logo + brand */}
			<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
				<img src={logoBase64} width={48} height={70} alt="" />
				<span
					style={{
						fontSize: "28px",
						fontWeight: 700,
						color: "#ec008c",
						letterSpacing: "-0.5px",
					}}
				>
					4Herfrika
				</span>
			</div>

			{/* Title */}
			<h1
				style={{
					fontSize: title.length > 50 ? "48px" : "56px",
					fontWeight: 700,
					color: "#03065c",
					marginTop: "40px",
					lineHeight: 1.15,
					maxWidth: "900px",
				}}
			>
				{title}
			</h1>

			{/* Subtitle */}
			{subtitle && (
				<p
					style={{
						fontSize: "24px",
						color: "#555555",
						marginTop: "20px",
						lineHeight: 1.4,
						maxWidth: "800px",
					}}
				>
					{subtitle}
				</p>
			)}

			{/* Bottom domain */}
			<div
				style={{
					position: "absolute",
					bottom: "40px",
					left: "80px",
					fontSize: "18px",
					color: "#ec008c",
					display: "flex",
				}}
			>
				4herfrika.org
			</div>

			{/* Bottom border */}
			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					width: "100%",
					height: "4px",
					background: "linear-gradient(90deg, #03065c 0%, #ec008c 100%)",
					display: "flex",
				}}
			/>
		</div>,
		size,
	);
}
