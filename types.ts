export default interface ProductData {
    minPriceNumber: number;
    avgPriceNumber: number;
    minPrice: string;
    avgPrice: string;
    productUrl: string;
    productGraphData: ProductGraphData[];
}

export interface ProductGraphData {
    /** 
     * Date in format YYYY-MM-DD (e.g., "2023-03-01")
     */
    date: string;
    minPrice: number;
    avgPrice: number;
}