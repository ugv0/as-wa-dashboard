export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { password } = req.body || {};
    const authHeader = req.headers['authorization'];
    const token = password || (authHeader ? authHeader.replace('Bearer ', '').trim() : null);

    if (token === '19902009') {
        return res.status(200).json({ success: true, authenticated: true });
    }
    return res.status(401).json({ success: false, error: 'Incorrect password' });
}
