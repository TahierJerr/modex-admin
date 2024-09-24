"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import PriceChart from "@/components/ui/price-chart";
import formatPrice from "@/lib/utils/formatPrice";
import priceToNumber from "@/lib/utils/priceToNumber";

const formSchema = z.object({
    url: z.string().url({
        message: "Invalid URL",
    }),
});

type ScrapeFormValues = z.infer<typeof formSchema>;

const ScrapeForm = () => {
    const form = useForm<ScrapeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
        },
    });

    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState<{ productName: string; minPrice: string; avgPrice: string; url: string; productUrl: string,  } | null>(null);
    const [chartData, setChartData] = useState<{ date: string; minPrice: number; avgPrice: number }[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: ScrapeFormValues) => {
        setLoading(true);
        setError(null); // Reset error state
        try {
            const response = await fetch(`/api/${params.storeId}/scrape?url=${encodeURIComponent(data.url)}`);
            const scrapedData = await response.json();
    
            if (response.ok && scrapedData) {
                setProductData(scrapedData.productData);
    
                // Check if productGraphData is available
                const chartData = scrapedData.productGraphData; // Use the correct field for chart data
                if (Array.isArray(chartData)) {
                    const transformedChartData = chartData.map((item) => ({
                        date: item.date, // Assuming it's already in the correct format
                        minPrice: Number(item.minPrice), // Ensure minPrice is a number
                        avgPrice: Number(item.avgPrice)  // Ensure avgPrice is a number
                    }));
    
                    // Save transformed chart data to state
                    setChartData(transformedChartData);
                } else {
                    console.error("Chart data is not an array:", chartData);
                    setError("No chart data available"); // Set error message
                    setChartData(null); // Reset chart data
                }
            } else {
                console.error("Scraping failed:", scrapedData.error);
                setError(scrapedData.error || "Scraping failed"); // Set error message
                setProductData(null); // Reset the state if scraping fails
                setChartData(null); // Reset chart data
            }
        } catch (error) {
            console.error("Error during scraping:", error);
            if (error instanceof Error) {
                setError("Error during scraping: " + error.message); // Set error message
            } else {
                setError("An unknown error occurred during scraping."); // Handle unknown error type
            }
        } finally {
            setLoading(false);
        }
    };
    

    const minPriceNumber = priceToNumber((productData?.minPrice ?? "0").toString());
    const avgPriceNumber = priceToNumber((productData?.avgPrice ?? "0").toString());

    return (
        <div className="scrape-form">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="url">URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://www.example.com/product" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Scraping..." : "Scrape Product Data"}
                    </Button>
                </form>
            </Form>
            {error && (
                <div className="error-message mt-4 p-4 border border-red-500 rounded-lg bg-red-100 text-red-700">
                    <p>{error}</p>
                </div>
            )}
            {productData && (
                <div className="product-data mt-8 p-4 border rounded-lg bg-gray-100">
                    <div>
                        <h2 className="text-lg font-bold mb-2">Scraped Product Data:</h2>
                        <p><strong>Product Name:</strong><a href={productData.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">{productData.productName}</a></p>
                        <p><strong>Lowest Product Price:</strong> {productData?.minPrice}</p>
                        <p><strong>Average Product Price:</strong> {productData?.avgPrice}</p>
                    </div>
                    <div>
                        {chartData && <PriceChart ProductName={productData.productName} productData={chartData} minPriceNumber={minPriceNumber} avgPriceNumber={avgPriceNumber} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrapeForm;
