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

    const productPrice = priceElement.text().trim();
    const linkElement = priceElement.find('a');
    const productUrl = linkElement.length ? linkElement.attr('href') || '' : '';

    if (!productUrl) {
        throw new Error("Url not found.");
    }

    return { productPrice, productUrl };
}

export function extractUri($: cheerio.Root) {
    const uriElement = $('twk-price-history-graph#priceHistoryGraph').first();
    const productUri = uriElement.length ? uriElement.attr('optionsrc') || '' : '';

    if (!productUri) {
        console.error("Uri not found.",);
        return '';
    }

    return productUri;
}
