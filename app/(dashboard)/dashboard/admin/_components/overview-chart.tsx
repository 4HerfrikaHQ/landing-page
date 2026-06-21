"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ChartPoint {
	date: string;
	label: string;
	bookings: number;
}

export function OverviewChart({ data }: { data: ChartPoint[] }) {
	const total = data.reduce((sum, d) => sum + d.bookings, 0);

	if (total === 0) {
		return (
			<div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
				No bookings in the last 30 days.
			</div>
		);
	}

	return (
		<div className="h-56 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
				>
					<defs>
						<linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#ec008c" stopOpacity={0.25} />
							<stop offset="100%" stopColor="#ec008c" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#e5e5e5"
						vertical={false}
					/>
					<XAxis
						dataKey="label"
						tick={{ fontSize: 11, fill: "#999" }}
						tickLine={false}
						axisLine={false}
						interval="preserveStartEnd"
						minTickGap={24}
					/>
					<YAxis
						allowDecimals={false}
						width={32}
						tick={{ fontSize: 11, fill: "#999" }}
						tickLine={false}
						axisLine={false}
					/>
					<Tooltip
						cursor={{ stroke: "#ec008c", strokeOpacity: 0.2 }}
						contentStyle={{
							borderRadius: 12,
							border: "1px solid #e5e5e5",
							boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
							fontSize: 12,
						}}
						labelStyle={{ color: "#171717", fontWeight: 600 }}
						formatter={(value) => [value, "Bookings"]}
					/>
					<Area
						type="monotone"
						dataKey="bookings"
						stroke="#ec008c"
						strokeWidth={2}
						fill="url(#bookingsFill)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
