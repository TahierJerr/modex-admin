import { ProductGraphData } from "@/types";

export async function fetchChartData(url: string): Promise<ProductGraphData[]> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);  // Log the full data response

        // Access the source data from the fetched response
        const sourceData = data.dataset?.source;

        // Ensure sourceData is an array and map it to ProductGraphData
        const productGraphData: ProductGraphData[] = Array.isArray(sourceData)
            ? sourceData.map(item => ({
                date: new Date(item[0]).toISOString().split('T')[0], // Convert timestamp to YYYY-MM-DD
                minPrice: Number(item[1]), // Ensure minPrice is a number
                avgPrice: Number(item[2])  // Ensure avgPrice is a number
            }))
            : [];

        return productGraphData;
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        throw error; // Re-throw the error for further handling if necessary
    }
}
