"use client"

import { useState, useEffect } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subMonths, subYears, startOfDay, endOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { ProductGraphData } from '@/types'


interface PriceChartProps {
    productData: ProductGraphData[]
}

const PriceChart:React.FC<PriceChartProps> = ({ productData }) => {
    const [data, setData] = useState<typeof productData>([])
        const [dateRange, setDateRange] = useState<DateRange | undefined>({
            from: subYears(new Date(), 1),
            to: new Date()
        })
        const [filterType, setFilterType] = useState('1y')
        
        useEffect(() => {
            setData(productData)
        }, [])
        
        const filterData = (start: Date | undefined, end: Date | undefined) => {
            if (!start || !end || !data) return []
            return data.filter(item => {
                const itemDate = new Date(item.date)
                return itemDate >= startOfDay(start) && itemDate <= endOfDay(end)
            })
        }
        
        const handleFilterChange = (value: string) => {
            setFilterType(value)
            const end = new Date()
            let start: Date
            
            switch (value) {
                case '1m':
                start = subMonths(end, 1)
                break
                case '6m':
                start = subMonths(end, 6)
                break
                case '1y':
                start = subYears(end, 1)
                break
                default:
                return
            }
            
            setDateRange({ from: start, to: end })
        }
        
        const filteredData = filterData(dateRange?.from, dateRange?.to)
        
        return (
        <Card className="w-full max-w-[1200px] mx-auto">
            <CardHeader>
                <CardTitle>Graphics Card Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4 mb-4">
                    <Select onValueChange={handleFilterChange} defaultValue="1y">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">Last Month</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="1y">Last Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>
                    {filterType === 'custom' && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    )}
                </div>
                <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                            dataKey="date" 
                            tickFormatter={(tick) => format(new Date(tick), 'MMM dd')}
                            />
                            <YAxis />
                            <Tooltip labelFormatter={(label) => format(new Date(label), 'yyyy-MM-dd')} />
                                <Legend />
                                <Line type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" name="Average Price" />
                                <Line type="monotone" dataKey="minPrice" stroke="hsl(var(--secondary))" name="Minimum Price" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            )
        }

export default PriceChart