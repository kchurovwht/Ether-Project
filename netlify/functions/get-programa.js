export async function handler(event) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'kchurovwht/Ether-Project';
    const FILE_PATH = 'ЕТЕР-ПОСЛЕДНО/programa.json';

    try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!res.ok) {
            return { statusCode: res.status, body: JSON.stringify({ error: 'Not found' }) };
        }

        const data = await res.json();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: data.content, sha: data.sha })
        };

    } catch(e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
}
