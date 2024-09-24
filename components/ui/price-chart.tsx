"use client"

import { useState, useEffect } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { format, subMonths, subYears, startOfDay, endOfDay, subWeeks } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { ProductGraphData } from '@/types'

interface PriceChartProps {
    productData: ProductGraphData[]
    ProductName: string;
    minPriceNumber: number;
    avgPriceNumber: number;
}

const PriceChart:React.FC<PriceChartProps> = ({ productData, ProductName, minPriceNumber, avgPriceNumber }) => {
    const [data, setData] = useState<typeof productData>([])
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subYears(new Date(), 1),
        to: new Date()
    })
    const [filterType, setFilterType] = useState('1y')
    
    useEffect(() => {
        setData(productData)
    }, [productData])
    
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
            case '2w':
                start = subWeeks(end, 2)
                break
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
                start = subMonths(end, 1)
                break
        }
        
        setDateRange({ from: start, to: end })
    }
    
    const filteredData = filterData(dateRange?.from, dateRange?.to)

    console.log(`minPriceNumber: ${minPriceNumber}, avgPriceNumber: ${avgPriceNumber}`)

    const yAxisMin = Math.min(...filteredData.map(item => item.minPrice), minPriceNumber)
    const yAxisMax = Math.max(...filteredData.map(item => item.avgPrice), avgPriceNumber)

    console.log(`Price Max: ${yAxisMax}, Price Min: ${yAxisMin}`)

    const calculatePercentageChange = () => {
        if (filteredData.length < 2) return 0
        const firstPrice = filteredData[0].avgPrice
        const lastPrice = filteredData[filteredData.length - 1].avgPrice
        return ((lastPrice - firstPrice) / firstPrice) * 100
    }

    const percentageChange = calculatePercentageChange()
    const isTrendingUp = percentageChange > 0
    const trendColor = isTrendingUp ? 'text-red-500' : 'text-green-500'
    const trendText = isTrendingUp ? 'up' : 'down'
    const trendIcon = isTrendingUp ? <TrendingUpIcon className='h-6 w-6 text-red-500 ml-2' strokeWidth={1.4} /> : <TrendingDownIcon className="h-6 w-6 ml-2 text-green-500" strokeWidth={1.4} />

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <CardTitle>{ProductName} Price Trends</CardTitle>
                <div className={`text-lg font-semibold ${trendColor} flex items-center`}>
                    {`Average price is trending ${trendText} by ${percentageChange.toFixed(2)}% `}
                    {trendIcon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4 mb-4">
                    <Select onValueChange={handleFilterChange} defaultValue="1y">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2w">Last 2 Weeks</SelectItem>
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
                                tickFormatter={(tick, index) => {
                                    const totalTicks = filteredData.length;
                                    const maxTicks = 10;
                                    if (totalTicks <= maxTicks || index % Math.ceil(totalTicks / maxTicks) === 0) {
                                        return format(new Date(tick), 'dd MMM');
                                    }
                                    return '';
                                }}
                            />
                            <YAxis domain={[yAxisMin, yAxisMax]} />
                            <Tooltip labelFormatter={(label) => format(new Date(label), 'dd-MM-yyyy')} />
                            <Legend />
                            <Line type="monotone" dataKey="avgPrice" stroke="#ff2c2c" name="Average Price" />
                            <Line type="monotone" dataKey="minPrice" stroke="#32cd32" name="Minimum Price" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default PriceChart
