import axios from 'axios';

export default async function handler(req, res) {
    try {
        const response = await axios.post('https://www.modex-admin.nl/api/clrgi1xkm0000gawknqwc2rl4/updatePrices');
        
        return res.status(200).send(`Success: ${response.data}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error.message);
        return res.status(500).send("Internal error");
    }
};
