const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Marcovanbd1/leadership-data';
const FILE = 'data.json';
const API = 'https://api.github.com';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const ghHeaders = {
    'Authorization': 'token ' + GITHUB_TOKEN,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'GET') {
      const r = await fetch(`${API}/repos/${REPO}/contents/${FILE}`, { headers: ghHeaders });
      if (!r.ok) throw new Error('GitHub GET failed: ' + r.status);
      const j = await r.json();
      const content = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ sha: j.sha, data: content })
      };
    }

    if (event.httpMethod === 'POST') {
      const { data, sha } = JSON.parse(event.body);
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
      const r = await fetch(`${API}/repos/${REPO}/contents/${FILE}`, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({ message: 'Leadership update', content, sha })
      });
      if (!r.ok) throw new Error('GitHub PUT failed: ' + r.status);
      const j = await r.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ sha: j.content.sha })
      };
    }

    return { statusCode: 405, headers, body: 'Method not allowed' };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
