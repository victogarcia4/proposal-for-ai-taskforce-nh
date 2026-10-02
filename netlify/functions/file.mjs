import { getStore } from '@netlify/blobs';
import { encodeBase64, githubConfig, githubRequest, readGithubFile, writeGithubFile } from './_github.mjs';

const store = () => getStore({ name: 'north-harris-ai-task-force-files', consistency: 'strong' });
const FILE_LIMIT_BYTES = 5 * 1024 * 1024;

function githubPath(id) {
  if (!/^[a-zA-Z0-9._-]+$/.test(id)) throw new Error('Invalid file id.');
  return `${githubConfig.filesPath}/${id}`;
}

export default async (request) => {
  return Response.json({ error: 'The original upload endpoint is retired. Use authenticated private attachments.' }, { status: 410 });
  try {
    if (request.method === 'GET') {
      const id = new URL(request.url).searchParams.get('id');
      if (!id) return new Response('Missing file id', { status: 400 });
      if (!githubConfig.configured) {
        const entry = await store().get(id, { type: 'arrayBuffer' });
        if (!entry) return new Response('File not found', { status: 404 });
        return new Response(entry);
      }
      const file = await readGithubFile(githubPath(id));
      if (!file) return new Response('File not found', { status: 404 });
      const blob = await githubRequest(`/repos/${githubConfig.owner}/${githubConfig.repo}/git/blobs/${file.sha}`);
      const bytes = Buffer.from(String(blob.content || '').replace(/\s/g, ''), 'base64');
      return new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' } });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const payload = await request.json();
    if (!payload.id || !payload.contentBase64) return new Response('Missing file content', { status: 400 });
    const bytes = Buffer.from(payload.contentBase64, 'base64');
    if (bytes.byteLength > FILE_LIMIT_BYTES) return new Response('File too large', { status: 413 });

    if (!githubConfig.configured) {
      await store().set(payload.id, bytes, { metadata: { name: payload.name || payload.id, mimeType: payload.mimeType || 'application/octet-stream' } });
      return Response.json({ id: payload.id, stored: true, provider: 'netlify-blobs' });
    }

    const path = githubPath(payload.id);
    const existing = await readGithubFile(path);
    const commit = await writeGithubFile(path, encodeBase64(bytes), `dashboard: save uploaded file ${payload.name || payload.id}`, existing?.sha || null);
    return Response.json({ id: payload.id, stored: true, provider: 'github', commitSha: commit?.commit?.sha || null });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to store the file.' }, { status: 500 });
  }
};

