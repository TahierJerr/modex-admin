export function extractName($: any) {
    const nameElement = $('h1').first();
    if (!nameElement.length) {
        throw new Error("Name not found.");
    }

    return nameElement.text().trim();
}

export function extractPriceData($: any) {
    const acceptedShopIds = [
        '9046',
        '156',
        '6743',
        '6703',
        '8294',
    ];

    // Initialize a variable to hold the found price element
    let priceElement: any = null;

    // Iterate over accepted shop IDs to find the first occurrence of each
    for (const shopId of acceptedShopIds) {
        // Find the first row for the current shop ID
        const shopRow = $(`tr.data-shop-id="${shopId}"`).first();
        
        if (shopRow.length) {
            priceElement = shopRow.find('td.shop-price'); // Find the price element within this shop row
            
            if (priceElement.length) {
                break; // Exit loop if we found a price element
            }
        }
    }

    // Check if a price element was found
    if (!priceElement || !priceElement.length) {
        throw new Error("Price not found.");
    }

    // Extract the text from the price element
    const productPriceText = priceElement.text().trim();
    const linkElement = priceElement.find('a');
    const productUrl = linkElement.length ? linkElement.attr('href') || '' : '';

    if (!productUrl) {
        throw new Error("Url not found.");
    }

    // Convert the price string to a number
    const productPrice = parseFloat(
        productPriceText
            .replace(/[^0-9.,]/g, '')    // Remove euro sign and any non-numeric characters
            .replace(/\./g, '')          // Remove thousands separator (period)
            .replace(',', '.')            // Replace decimal comma with a dot
    );

    if (isNaN(productPrice)) {
        throw new Error("Invalid price format.");
    }

    // Return the product price and URL
    return { productPrice, productUrl };
}


export function extractUri($: cheerio.Root) {
    const uriElement = $('twk-price-history-graph#priceHistoryGraph').first();
    const productUri = uriElement.length ? uriElement.attr('optionsrc') || '' : '';

    if (!productUri) {
        console.error("Uri not found.",);
        return null;
    }

    return productUri;
}
