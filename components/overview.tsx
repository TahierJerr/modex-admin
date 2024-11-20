"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface OverviewProps {
    data: Array<{ name: string; total: number }>
}

export default function Overview({ data }: OverviewProps) {
    return (
    <Card>
        <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer
            config={{
            total: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
            },
        }}
        className="h-[350px]"
        >
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-total)" }}
                activeDot={{ r: 6, fill: "var(--color-total)" }}
                />
            </LineChart>
        </ResponsiveContainer>
    </ChartContainer>
</CardContent>
</Card>
)
}