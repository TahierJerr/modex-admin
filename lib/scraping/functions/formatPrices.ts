import formatPrice from "@/lib/utils/formatPrice";

export function formatPrices(productPrice: number) {
    const prices: number[] = [productPrice];

    const avgPrice = prices.length
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : productPrice;

    const formattedMinPrice = formatPrice(productPrice);
    const formattedAvgPrice = formatPrice(avgPrice);

    return {
        minPriceNumber: productPrice,
        avgPriceNumber: avgPrice,
        minPrice: formattedMinPrice,
        avgPrice: formattedAvgPrice,
    };
}
