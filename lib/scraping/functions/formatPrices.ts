import formatPrice from "@/lib/utils/formatPrice";

export function formatPrices(productPrice: number) {
    console.log("Initial Product Price (number):", productPrice); // Log the incoming price

    // Ensure the product price is rounded to two decimal places
    const roundedPrice = parseFloat(productPrice.toFixed(2));
    console.log("Rounded Product Price (to 2 decimals):", roundedPrice); // Log the rounded price

    // Initialize an array of prices and push the rounded product price
    const prices: number[] = [roundedPrice];

    // Calculate the average price and round it to two decimal places
    const avgPrice = prices.length
        ? parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2))
        : roundedPrice;

    // Log the average price
    console.log("Calculated Average Price (number):", avgPrice); 

    // Format both the minimum price and the average price for display
    const formattedMinPrice = formatPrice(roundedPrice);
    const formattedAvgPrice = formatPrice(avgPrice);

    // Log formatted prices
    console.log("Formatted Minimum Price:", formattedMinPrice);
    console.log("Formatted Average Price:", formattedAvgPrice);

    return {
        minPriceNumber: roundedPrice, // The price saved in the database as 1049.00
        avgPriceNumber: avgPrice,     // The average price saved in the database
        minPrice: formattedMinPrice,  // Formatted version for display
        avgPrice: formattedAvgPrice,  // Formatted average price for display
    };
}
