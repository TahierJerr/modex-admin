export function extractName($: any) {
    const nameElement = $('h1').first();
    if (!nameElement.length) {
        throw new Error("Name not found.");
    }

    return nameElement.text().trim();
}

export function extractPriceData($: any) {
    const priceElement = $('td.shop-price').first();
    if (!priceElement.length) {
        throw new Error("Price not found.");
    }

    let productPrice = priceElement.text().trim();

    productPrice = productPrice.replace(/[^\d,.-]/g, '').replace(',', '.');

    const priceNumber = parseFloat(productPrice);

    if (isNaN(priceNumber)) {
        throw new Error("Invalid price format.");
    }

    const linkElement = priceElement.find('a');
    const productUrl = linkElement.length ? linkElement.attr('href') || '' : '';

    if (!productUrl) {
        throw new Error("Url not found.");
    }

    return { productPrice: priceNumber, productUrl };
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
