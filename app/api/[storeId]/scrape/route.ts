// /pages/api/scrape.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query; // Extract URL from the query parameter
    if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing or invalid URL parameter" });
    }

    try {
        const { data } = await axios.get(url); // Make the request from the server

        // Use cheerio to scrape data from the response
        const $ = cheerio.load(data);
        const productName = $('h1').text().trim();
        const productPrice = $('.pricecontainer').text().trim();

        if (!productName || !productPrice) {
            throw new Error("Unable to scrape product data");
        }

        // Send the scraped data back to the client
        res.status(200).json({
            name: productName,
            price: productPrice,
            url: url,
        });
    } catch (error) {
        console.error("Error scraping product:", error);
        res.status(500).json({ error: "Failed to scrape product data" });
    }
}
