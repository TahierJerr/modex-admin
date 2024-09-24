import { ProductGraphData } from "@/types";

export async function fetchChartData(url: string): Promise<ProductGraphData[]> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);  // Log the full data response

        // Fallback if dataset is not an array
        const dataset = Array.isArray(data.dataset) ? data.dataset : [];
        return dataset;
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        throw error;
    }
}
