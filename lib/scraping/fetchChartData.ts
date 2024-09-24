import { ProductGraphData } from "@/types";

export async function fetchChartData(url: string): Promise<ProductGraphData[]> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }

        const data: { dataset: ProductGraphData[] } = await response.json();
        
        if (!Array.isArray(data.dataset)) {
            throw new Error(`Expected an array for dataset but received: ${typeof data.dataset}`);
        }

        return data.dataset;
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        throw error;
    }
}
