export async function handler(event) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'kchurovwht/Ether-Project';
    const FILE_PATH = 'ЕТЕР-ПОСЛЕДНО/programa.json';

    try {
        const res = await fetch(
            `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!res.ok) {
            return { statusCode: res.status, body: JSON.stringify({ error: 'Not found' }) };
        }

        const meta = await res.json();

        // Decode base64 → UTF-8 properly
        const binary = atob(meta.content.replace(/\n/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const jsonString = new TextDecoder('utf-8').decode(bytes);
        const data = JSON.parse(jsonString);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, sha: meta.sha })
        };

    } catch(e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
}
