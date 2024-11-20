"use client";

import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewProps {
    data: Array<{ name: string; total: number }>;
}

export default function Overview({ data }: OverviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                            />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip formatter={(value) => `€${value}`} />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#4A90E2" // Use a fallback color for visibility
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#4A90E2" }}
                                activeDot={{ r: 6, fill: "#4A90E2" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
