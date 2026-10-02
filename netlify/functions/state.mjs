import { getStore } from '@netlify/blobs';
import { encodeBase64, githubConfig, readGithubFile, writeGithubFile } from './_github.mjs';

const store = () => getStore({ name: 'north-harris-ai-task-force', consistency: 'strong' });
const key = 'dashboard-state';

const baseState = {
  version: 1,
  savedAt: null,
  tables: { curriculum: [], workplace: [], training: [] },
  actions: [
    { id: 'action-1', text: 'Consolidated one-page proposal drafted', owner: 'Assign', date: 'Fill in', status: 'Open' },
    { id: 'action-2', text: 'Proposal reviewed by North Harris leadership', owner: 'Assign', date: 'Fill in', status: 'Open' },
    { id: 'action-3', text: 'Proposal carried to the system-level meeting across the LSC colleges', owner: 'Assign', date: 'Fill in', status: 'Open' }
  ],
  files: [],
  resources: [{ id: 'source-doc', name: 'AI in Education & Workplace - North Harris Working Session', url: 'https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit?usp=sharing', kind: 'Google Doc', createdAt: 'September 22, 2026' }]
};

function mergeState(input) {
  return {
    ...baseState,
    ...input,
    tables: { ...baseState.tables, ...(input?.tables || {}) },
    actions: Array.isArray(input?.actions) && input.actions.length ? input.actions : baseState.actions,
    files: Array.isArray(input?.files) ? input.files : [],
    resources: Array.isArray(input?.resources) && input.resources.length ? input.resources : baseState.resources
  };
}

function appendOnce(items, item) {
  return items.some((existing) => existing.id && item.id && existing.id === item.id) ? items : [...items, item];
}

function applyAction(current, payload) {
  if (payload.action === 'add-entry' && current.tables[payload.tableKey] && payload.entry) {
    return { ...current, tables: { ...current.tables, [payload.tableKey]: appendOnce(current.tables[payload.tableKey], payload.entry) } };
  }
  if (payload.action === 'add-action' && payload.item) {
    return { ...current, actions: appendOnce(current.actions, payload.item) };
  }
  if (payload.action === 'add-resource' && payload.resource) {
    return { ...current, resources: appendOnce(current.resources, payload.resource) };
  }
  if (payload.action === 'add-file' && payload.file) {
    return { ...current, files: appendOnce(current.files, payload.file) };
  }
  if (payload.action === 'replace' && payload.state) return mergeState(payload.state);
  return null;
}

function persistenceMeta(extra = {}) {
  return {
    provider: githubConfig.configured ? 'github' : 'netlify-blobs',
    repository: githubConfig.configured ? githubConfig.repository : null,
    branch: githubConfig.configured ? githubConfig.branch : null,
    ...extra
  };
}

async function readBlobState() {
  return mergeState(await store().get(key, { type: 'json' }));
}

async function readGithubState() {
  const file = await readGithubFile(githubConfig.statePath);
  if (!file) return { state: mergeState(null), sha: null };
  const content = Buffer.from(String(file.content || '').replace(/\s/g, ''), 'base64').toString('utf8');
  return { state: mergeState(JSON.parse(content)), sha: file.sha };
}

function commitMessage(payload) {
  const labels = {
    'add-entry': 'save table contribution',
    'add-action': 'save action item',
    'add-resource': 'save source link',
    'add-file': 'save artifact metadata',
    replace: 'replace dashboard state'
  };
  return `dashboard: ${labels[payload.action] || 'save shared state'}`;
}

async function saveGithubState(payload) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const currentResult = await readGithubState();
    const next = applyAction(currentResult.state, payload);
    if (!next) return { error: 'Invalid action' };
    next.savedAt = new Date().toISOString();
    try {
      const commit = await writeGithubFile(githubConfig.statePath, encodeBase64(`${JSON.stringify(next, null, 2)}\n`), commitMessage(payload), currentResult.sha);
      return { state: next, commit };
    } catch (error) {
      if (![409, 422].includes(error.status) || attempt === 2) throw error;
    }
  }
  throw new Error('Unable to save the shared dashboard to GitHub.');
}

export default async (request) => {
  return Response.json({ error: 'The original dashboard endpoint is retired. Use the authenticated consultation.' }, { status: 410 });
  try {
    if (request.method === 'GET') {
      if (githubConfig.configured) {
        const result = await readGithubState();
        return Response.json({ ...result.state, persistence: persistenceMeta() });
      }
      return Response.json({ ...(await readBlobState()), persistence: persistenceMeta() });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const payload = await request.json();

    if (githubConfig.configured) {
      const result = await saveGithubState(payload);
      if (result.error) return new Response(result.error, { status: 400 });
      return Response.json({ ...result.state, persistence: persistenceMeta({ commitSha: result.commit?.commit?.sha || null }) });
    }

    const current = await readBlobState();
    const next = applyAction(current, payload);
    if (!next) return new Response('Invalid action', { status: 400 });
    next.savedAt = new Date().toISOString();
    await store().setJSON(key, next);
    return Response.json({ ...next, persistence: persistenceMeta() });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to read or save the shared dashboard.' }, { status: 500 });
  }
};


