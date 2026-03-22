import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
