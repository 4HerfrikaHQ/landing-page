"use client";

import { format, parseISO } from "date-fns";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
	Area,
	AreaChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";

interface StatsChartsProps {
	series: { bucket: string; count: number }[];
	counts: {
		total: number;
		confirmed: number;
		completed: number;
		noShow: number;
		cancelled: number;
	};
}

// Colors aligned to the StatusBadge palette.
const STATUS_COLORS = {
	confirmed: "#2563eb", // blue-600
	completed: "#16a34a", // green-600
	no_show: "#dc2626", // red-600 (destructive)
	cancelled: "#9ca3af", // gray-400
} as const;

export function StatsCharts({ series, counts }: StatsChartsProps) {
	const timeData = series.map((s) => ({
		label: safeWeekLabel(s.bucket),
		count: s.count,
	}));

	const statusData = [
		{ name: "Confirmed", key: "confirmed", value: counts.confirmed },
		{ name: "Completed", key: "completed", value: counts.completed },
		{ name: "No show", key: "no_show", value: counts.noShow },
		{ name: "Cancelled", key: "cancelled", value: counts.cancelled },
	].filter((d) => d.value > 0);

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
			{/* Bookings over time */}
			<DataCard className="lg:col-span-3">
				<DataCardSection className="space-y-4">
					<h2 className="font-heading text-sm font-semibold text-foreground">
						Bookings over time
					</h2>
					{timeData.length === 0 ? (
						<EmptyState
							icon={BarChart3}
							title="No bookings in this range"
							description="Try a wider time range to see your booking trend."
						/>
					) : (
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={timeData}
									margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="bookingsFill"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="0%"
												stopColor="#ec008c"
												stopOpacity={0.25}
											/>
											<stop offset="100%" stopColor="#ec008c" stopOpacity={0} />
										</linearGradient>
									</defs>
									<XAxis
										dataKey="label"
										tick={{ fontSize: 12, fill: "#555" }}
										tickLine={false}
										axisLine={{ stroke: "#e5e5e5" }}
									/>
									<YAxis
										allowDecimals={false}
										tick={{ fontSize: 12, fill: "#555" }}
										tickLine={false}
										axisLine={false}
										width={32}
									/>
									<Tooltip
										cursor={{ stroke: "#ec008c", strokeOpacity: 0.2 }}
										contentStyle={{
											borderRadius: 12,
											border: "1px solid #e5e5e5",
											fontSize: 12,
										}}
									/>
									<Area
										type="monotone"
										dataKey="count"
										name="Bookings"
										stroke="#ec008c"
										strokeWidth={2}
										fill="url(#bookingsFill)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					)}
				</DataCardSection>
			</DataCard>

			{/* Status breakdown */}
			<DataCard className="lg:col-span-2">
				<DataCardSection className="space-y-4">
					<h2 className="font-heading text-sm font-semibold text-foreground">
						Status breakdown
					</h2>
					{statusData.length === 0 ? (
						<EmptyState
							icon={PieChartIcon}
							title="No bookings yet"
							description="Status breakdown appears once you have bookings."
						/>
					) : (
						<>
							<div className="h-48">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={statusData}
											dataKey="value"
											nameKey="name"
											innerRadius={48}
											outerRadius={72}
											paddingAngle={2}
											strokeWidth={0}
										>
											{statusData.map((entry) => (
												<Cell
													key={entry.key}
													fill={
														STATUS_COLORS[
															entry.key as keyof typeof STATUS_COLORS
														]
													}
												/>
											))}
										</Pie>
										<Tooltip
											contentStyle={{
												borderRadius: 12,
												border: "1px solid #e5e5e5",
												fontSize: 12,
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
							<ul className="space-y-1.5">
								{statusData.map((entry) => (
									<li
										key={entry.key}
										className="flex items-center justify-between text-sm"
									>
										<span className="flex items-center gap-2 text-muted-foreground">
											<span
												className="size-2.5 rounded-full"
												style={{
													backgroundColor:
														STATUS_COLORS[
															entry.key as keyof typeof STATUS_COLORS
														],
												}}
											/>
											{entry.name}
										</span>
										<span className="font-medium tabular-nums text-foreground">
											{entry.value}
										</span>
									</li>
								))}
							</ul>
						</>
					)}
				</DataCardSection>
			</DataCard>
		</div>
	);
}

function safeWeekLabel(bucket: string) {
	try {
		return format(parseISO(bucket), "MMM d");
	} catch {
		return bucket;
	}
}
