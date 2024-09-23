export default function priceToNumber(priceString: string): number {
    const cleanedString = priceString
        .replace('€', '')
        .replace(/\s/g, '')
        .replace(',', '.');

    const result = parseFloat(cleanedString);

    return isNaN(result) ? 0 : result; 
}