let cachedBotUrl = null;
let lastFetchTime = 0;

export async function getBotUrl(customOverride = null) {
    if (customOverride && customOverride.startsWith('http')) {
        cachedBotUrl = customOverride.trim().replace(/\/$/, '');
        return cachedBotUrl;
    }

    if (process.env.BOT_TUNNEL_URL) {
        return process.env.BOT_TUNNEL_URL.trim().replace(/\/$/, '');
    }

    // Refresh every 20 seconds from GitHub repo endpoint.txt
    const now = Date.now();
    if (cachedBotUrl && (now - lastFetchTime < 20000)) {
        return cachedBotUrl;
    }

    try {
        const res = await fetch('https://raw.githubusercontent.com/ugv0/as-wa-bot/main/endpoint.txt', {
            headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
            const text = (await res.text()).trim();
            if (text.startsWith('http')) {
                cachedBotUrl = text.replace(/\/$/, '');
                lastFetchTime = now;
                return cachedBotUrl;
            }
        }
    } catch (e) {
        console.error('Error fetching endpoint.txt:', e);
    }

    return cachedBotUrl || null;
}

export function setCachedBotUrl(url) {
    if (url && url.startsWith('http')) {
        cachedBotUrl = url.trim().replace(/\/$/, '');
        lastFetchTime = Date.now();
    }
}
