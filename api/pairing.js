import { getBotUrl } from './_bot.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : req.query.token;

    if (token !== '19902009') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid password' });
    }

    const { phoneNumber, botUrl: overrideUrl } = req.body || {};
    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const botUrl = await getBotUrl(overrideUrl);

    if (!botUrl) {
        return res.status(503).json({ success: false, error: 'Bot runner tunnel is currently offline' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const botRes = await fetch(`${botUrl}/api/request-pairing-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await botRes.json();
        return res.status(botRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
