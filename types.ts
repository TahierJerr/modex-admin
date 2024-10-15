export default interface ProductData {
    productName: string;
    minPriceNumber: number;
    avgPriceNumber: number;
    minPrice: string;
    avgPrice: string;
    productUrl: string;
    productGraphData: ProductGraphData[];
    error: boolean
}

export interface ProductGraphData {
    /** 
     * Date in format YYYY-MM-DD (e.g., "2023-03-01")
     */
    date: string;
    minPrice: number;
    avgPrice: number;
}