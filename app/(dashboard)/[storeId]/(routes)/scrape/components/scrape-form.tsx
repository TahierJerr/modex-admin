"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";


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
    const [productData, setProductData] = useState<{ name: string; price: string; url: string } | null>(null);

    const onSubmit = async (data: ScrapeFormValues) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/${params.storeId}/scrape?url=${encodeURIComponent(data.url)}`);
            const scrapedData = await response.json();
    
            if (response.ok && scrapedData) {
                setProductData(scrapedData); // Save the scraped data to state
            } else {
                console.error("Scraping failed:", scrapedData.error);
                setProductData(null); // Reset the state if scraping fails
            }
        } catch (error) {
            console.error("Error during scraping:", error);
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
                    <Button type="submit" disabled={loading}>
                        {loading ? "Scraping..." : "Scrape Product Data"}
                    </Button>
                </form>
            </Form>
            {productData && (
                <div className="product-data mt-8 p-4 border rounded-lg bg-gray-100">
                    <h2 className="text-lg font-bold mb-2">Scraped Product Data:</h2>
                    <p><strong>Product Name:</strong> {productData.name}</p>
                    <p><strong>Product Price:</strong> {productData.price}</p>
                    <p><strong>Product URL:</strong> <a href={productData.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{productData.url}</a></p>
                </div>
            )}
        </div>
    );
};

export default ScrapeForm;
