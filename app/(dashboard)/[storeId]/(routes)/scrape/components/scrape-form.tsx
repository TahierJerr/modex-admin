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

const formSchema = z.object({
    url: z.string().url({
        message: "Invalid URL",
    }),
    uri: z.string().url({
        message: "Invalid URL",
    }),
});

type ScrapeFormValues = z.infer<typeof formSchema>;

const ScrapeForm = () => {
    const form = useForm<ScrapeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
            uri: "",
        },
    });

    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState<{ name: string; minPrice: string; avgPrice: string; url: string; productUrl: string } | null>(null);
    const [chartData, setChartData] = useState<{ date: string; minPrice: number; avgPrice: number }[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: ScrapeFormValues) => {
        setLoading(true);
        setError(null); // Reset error state
        try {
            const response = await fetch(`/api/${params.storeId}/scrape?url=${encodeURIComponent(data.url)}&uri=${encodeURIComponent(data.uri)}`);
            const scrapedData = await response.json();
    
            if (response.ok && scrapedData) {
                // Save product data to state
                setProductData(scrapedData.productData);
    
                // Extract and transform the chart data from the dataset
                const transformedChartData = scrapedData.dataset.source.map((item: any) => ({
                    date: new Date(item[0]).toISOString().split('T')[0], // Convert timestamp to YYYY-MM-DD
                    minPrice: Number(item[1]), // Ensure minPrice is a number
                    avgPrice: Number(item[2])  // Ensure avgPrice is a number
                }));
    
                // Save transformed chart data to state
                setChartData(transformedChartData);
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
                    <FormField
                        control={form.control}
                        name="uri"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="uri">Chart URI</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://tweakers.net/ajax/price_chart/xxxxxxxx/nl/" />
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
                        <p><strong>Product Name:</strong> {productData.name}</p>
                        <p><strong>Lowest Product Price:</strong> {productData.minPrice}</p>
                        <p><strong>Average Product Price:</strong> {productData.avgPrice}</p>
                        <p><strong>Product URL:</strong> <a href={productData.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">{productData.productUrl}</a></p>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-2">Product Price Chart:</h2>
                        {/* Pass chartData to PriceChart component */}
                        {chartData && <PriceChart productData={chartData} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrapeForm;
