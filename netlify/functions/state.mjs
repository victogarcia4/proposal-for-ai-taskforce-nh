import { getStore } from '@netlify/blobs';

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

async function readState() {
  return mergeState(await store().get(key, { type: 'json' }));
}

export default async (request) => {
  try {
    if (request.method === 'GET') return Response.json(await readState());
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const payload = await request.json();
    const current = await readState();
    let next = current;
    if (payload.action === 'add-entry' && current.tables[payload.tableKey] && payload.entry) {
      next = { ...current, tables: { ...current.tables, [payload.tableKey]: [...current.tables[payload.tableKey], payload.entry] } };
    } else if (payload.action === 'add-action' && payload.item) {
      next = { ...current, actions: [...current.actions, payload.item] };
    } else if (payload.action === 'add-resource' && payload.resource) {
      next = { ...current, resources: [...current.resources, payload.resource] };
    } else if (payload.action === 'add-file' && payload.file) {
      next = { ...current, files: [...current.files, payload.file] };
    } else if (payload.action === 'replace' && payload.state) {
      next = mergeState(payload.state);
    } else {
      return new Response('Invalid action', { status: 400 });
    }
    next.savedAt = new Date().toISOString();
    await store().setJSON(key, next);
    return Response.json(next);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to read or save the shared dashboard.' }, { status: 500 });
  }
};
