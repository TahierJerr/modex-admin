import formatPrice from "@/lib/utils/formatPrice";
import priceToNumber from "@/lib/utils/priceToNumber";

export function formatPrices(productPrice: string) {
    const prices: number[] = [];
    const parsedPrice = parseFloat(productPrice.replace(/€|\s/g, '').replace(/,/g, '.').replace(/-/g, '00'));
    if (!isNaN(parsedPrice)) {
        prices.push(parsedPrice);
    }

    const avgPrice = prices.length
        ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toString()
        : parsedPrice.toString();

    const formattedMinPrice = formatPrice(parsedPrice);
    const formattedAvgPrice = formatPrice(parseFloat(avgPrice));

    return {
        minPriceNumber: priceToNumber(productPrice),
        avgPriceNumber: priceToNumber(avgPrice),
        minPrice: formattedMinPrice,
        avgPrice: formattedAvgPrice,
    };
}
