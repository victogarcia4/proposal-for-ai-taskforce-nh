import { getStore } from '@netlify/blobs';

const store = () => getStore({ name: 'north-harris-ai-task-force-files', consistency: 'strong' });

export default async (request) => {
  try {
    if (request.method === 'GET') {
      const id = new URL(request.url).searchParams.get('id');
      if (!id) return new Response('Missing file id', { status: 400 });
      const entry = await store().get(id, { type: 'arrayBuffer' });
      if (!entry) return new Response('File not found', { status: 404 });
      return new Response(entry);
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const payload = await request.json();
    if (!payload.id || !payload.contentBase64) return new Response('Missing file content', { status: 400 });
    const bytes = Buffer.from(payload.contentBase64, 'base64');
    if (bytes.byteLength > 5 * 1024 * 1024) return new Response('File too large', { status: 413 });
    await store().set(payload.id, bytes, { metadata: { name: payload.name || payload.id, mimeType: payload.mimeType || 'application/octet-stream' } });
    return Response.json({ id: payload.id, stored: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to store the file.' }, { status: 500 });
  }
};
