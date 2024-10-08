import formatPrice from "@/lib/utils/formatPrice";

export function formatPrices(productPrice: number) {
    const roundedPrice = parseFloat(productPrice.toFixed(2));

    const prices: number[] = [roundedPrice];

    const avgPrice = prices.length
        ? parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2))
        : roundedPrice;

    const formattedMinPrice = formatPrice(roundedPrice);
    const formattedAvgPrice = formatPrice(avgPrice);

    console.log("minpricenumber", roundedPrice);
    
    return {
        minPriceNumber: roundedPrice, // The price saved in the database as 1049.45
        avgPriceNumber: avgPrice,     // The average price saved in the database
        minPrice: formattedMinPrice,  // Formatted version for display
        avgPrice: formattedAvgPrice,  // Formatted average price for display
    };
}