import formatPrice from "@/lib/utils/formatPrice";
import priceToNumber from "@/lib/utils/priceToNumber";

export function formatPrices(productPrice: string) {
    const prices: number[] = [];
    const parsedPrice = formatPrice(parseFloat(productPrice));

    prices.push(parseFloat(productPrice));

    const avgPrice = prices.length
        ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toString()
        : parsedPrice.toString();

    const formattedMinPrice = formatPrice(parseFloat(productPrice));
    const formattedAvgPrice = formatPrice(parseFloat(avgPrice));

    return {
        minPriceNumber: priceToNumber(productPrice),
        avgPriceNumber: priceToNumber(avgPrice),
        minPrice: formattedMinPrice,
        avgPrice: formattedAvgPrice,
    };
}
