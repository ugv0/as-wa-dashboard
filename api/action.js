import { getBotUrl, setCachedBotUrl } from './_bot.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : req.query.token;

    if (token !== '19902009') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid password' });
    }

    const { action, url } = req.body || {};

    if (action === 'set_relay_url') {
        if (url) {
            setCachedBotUrl(url);
            return res.status(200).json({ success: true, message: 'Relay URL updated', url });
        }
    }

    const botUrl = await getBotUrl(req.query.botUrl || req.body?.botUrl);

    if (action === 'restart' && botUrl) {
        try {
            const botRes = await fetch(`${botUrl}/api/restart`, { method: 'POST' });
            const data = await botRes.json();
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
}
