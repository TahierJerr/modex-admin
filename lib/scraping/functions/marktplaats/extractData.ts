import { Graphics } from "@prisma/client";

export function extractPriceData(graphics: Graphics, $: any) {
    const searchQuery = graphics.name.replace(/\s/g, '+');
    const url = `https://www.marktplaats.nl/l/computers-en-software/videokaarten/#q:${searchQuery}|searchInTitleAndDescription:true`


    const div = $("div.cardsCollection");

    const article = div.find("article").eq(3);

    const price = article.find("h4.hz-Title").text().trim();

    const productPrice = parseFloat(
        price
            .replace(/[^0-9.,]/g, '')    // Remove euro sign and any non-numeric characters
            .replace(/\./g, '')          // Remove thousands separator (period)
            .replace(',', '.')            // Replace decimal comma with a dot
    );

    if (isNaN(productPrice)) {
        throw new Error("Invalid price format.");
    }

    return { productPrice, url };
}