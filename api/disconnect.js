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

    const botUrl = await getBotUrl(req.query.botUrl || req.body?.botUrl);

    if (!botUrl) {
        return res.status(503).json({ success: false, error: 'Bot runner tunnel is currently offline' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const botRes = await fetch(`${botUrl}/api/disconnect`, {
            method: 'POST',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await botRes.json();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
