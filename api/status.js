import { getBotUrl } from './_bot.js';

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

    const botUrl = await getBotUrl(req.query.botUrl);

    if (!botUrl) {
        return res.status(200).json({
            success: true,
            online: false,
            botUrl: null,
            message: 'Waiting for GitHub Actions runner to establish Cloudflare Tunnel... (endpoint.txt)',
            settings: {
                autoReply: true,
                onlyDm: false,
                selfTag: true,
                swipeReply: true,
                allTag: true,
                systemPrompt: 'You are a helpful, friendly, and smart WhatsApp AI assistant powered by NVIDIA Nemotron 3.5 Bolt.'
            },
            logs: []
        });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${botUrl}/api/status`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return res.status(200).json({
                success: true,
                online: false,
                botUrl,
                error: `Bot replied with HTTP ${response.status}`,
                logs: []
            });
        }

        const data = await response.json();
        return res.status(200).json({
            success: true,
            online: true,
            botUrl,
            ...data
        });
    } catch (err) {
        return res.status(200).json({
            success: true,
            online: false,
            botUrl,
            error: `Failed to reach bot tunnel: ${err.message}`,
            logs: []
        });
    }
}
