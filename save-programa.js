export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'kchurovwht/Ether-Project';
    const FILE_PATH = 'ЕТЕР-ПОСЛЕДНО/programa.json';

    try {
        const { data, sha } = JSON.parse(event.body);

        // Get current SHA if not provided
        let currentSha = sha;
        if (!currentSha) {
            const getRes = await fetch(
                `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`,
                { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
            );
            if (getRes.ok) {
                const existing = await getRes.json();
                currentSha = existing.sha;
            }
        }

        // Encode properly: TextEncoder → Uint8Array → base64
        const jsonString = JSON.stringify(data, null, 2);
        const bytes = new TextEncoder().encode(jsonString);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        const content = btoa(binary);

        const body = {
            message: `Програма: ${data.sedmitza || new Date().toLocaleDateString('bg')}`,
            content: content,
        };
        if (currentSha) body.sha = currentSha;

        const res = await fetch(
            `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }
        );

        if (!res.ok) {
            const err = await res.json();
            return { statusCode: res.status, body: JSON.stringify({ error: err.message }) };
        }

        const result = await res.json();
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ok: true, sha: result.content.sha })
        };

    } catch(e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
}
