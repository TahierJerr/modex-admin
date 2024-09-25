import formatPrice from "@/lib/utils/formatPrice";
import priceToNumber from "@/lib/utils/priceToNumber";

export function formatPrices(productPrice: string) {
    const prices: number[] = [];
    const parsedPrice = formatPrice(parseFloat(productPrice));

    prices.push(parseFloat(productPrice));

    const minPrice = prices.length
        ? (Math.min(...prices)).toString()
        : parsedPrice.toString();

    const avgPrice = prices.length
        ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toString()
        : parsedPrice.toString();

    const formattedMinPrice = formatPrice(parseFloat(minPrice));
    const formattedAvgPrice = formatPrice(parseFloat(avgPrice));

    return {
        minPriceNumber: priceToNumber(minPrice),
        avgPriceNumber: priceToNumber(avgPrice),
        minPrice: formattedMinPrice,
        avgPrice: formattedAvgPrice,
    };
}
