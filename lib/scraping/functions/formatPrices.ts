import formatPrice from "@/lib/utils/formatPrice";

export function formatPrices(productPrice: number) {
    console.log("Initial Product Price (number):", productPrice);

    const roundedPrice = parseFloat(productPrice.toFixed(2));

    const prices: number[] = [roundedPrice];

    const avgPrice = prices.length
        ? parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2))
        : roundedPrice;

    const formattedMinPrice = formatPrice(roundedPrice);
    const formattedAvgPrice = formatPrice(avgPrice);

    return {
        minPriceNumber: roundedPrice,
        avgPriceNumber: avgPrice,     
        minPrice: formattedMinPrice,  
        avgPrice: formattedAvgPrice,  
    };
}
