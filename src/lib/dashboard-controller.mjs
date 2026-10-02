import { createSaveQueue, mergeAppendOnlyState } from './persistence.mjs';

const SOURCE_DOC_URL = 'https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit?usp=sharing';
const LOCAL_KEY = 'north-harris-ai-task-force-dashboard-v1';
const FILE_LIMIT_BYTES = 5 * 1024 * 1024;

/** @param {HTMLElement} root */
export function initializeDashboard(root) {
const lifecycle = new AbortController();
let disposed = false;
const listen = (element, event, handler) => element.addEventListener(event, handler, { signal: lifecycle.signal });

if (new URLSearchParams(window.location.search).has('reset') || window.location.hash === '#reset') {
  try {
    localStorage.removeItem(LOCAL_KEY);
    localStorage.removeItem('north-harris-theme');
  } catch { /* A restricted browser can still run an in-memory session. */ }
}

const primerSlides = [
  { label: 'The shared lens', letter: '', title: 'PRIMER keeps AI from replacing the thinking.', body: 'A six-part lens for designing assignments and workplace processes that still ask people to make meaning, choices, and connections.', author: 'Framework author: Kayla Almaguer', support: ['In person or online', 'A design quality, not a compliance checklist'] },
  { label: 'Process-Oriented', letter: 'P', title: 'Grade the path, not just the final output.', body: 'Drafts, decisions, revisions, and dead ends are part of the evidence. The work should make its own process visible.', support: ['Ask for a proposal before a polished answer', 'Capture decisions and changes'] },
  { label: 'Reflective', letter: 'R', title: 'Build in a moment to think about how the work happened.', body: 'Reflection turns tool use into learning. It asks what changed, what was trusted, and what a person would do differently next time.', support: ['Use a short process note', 'Name the judgment behind the choice'] },
  { label: 'Interactive', letter: 'I', title: 'Require real exchange with another person.', body: 'A partner, team, peer reviewer, or stakeholder creates an encounter that cannot be replaced by solo output alone.', support: ['Make feedback consequential', 'Let people build on one another'] },
  { label: 'Multi-Modal', letter: 'M', title: 'Let understanding take more than one form.', body: 'Written, spoken, visual, and hands-on formats make room for different strengths and make learning harder to fake.', support: ['Offer more than one way to show the work', 'Match format to the real audience'] },
  { label: 'Engaging', letter: 'E', title: 'Connect to genuine curiosity or motivation.', body: 'The work should feel connected to a question or situation a person actually wants to understand, not just a rule they need to complete.', support: ['Start with a meaningful problem', 'Give people a real choice'] },
  { label: 'Relevant', letter: 'R', title: 'Tie the work to real stakes.', body: 'A real problem, audience, or decision gives AI use a context that can be discussed and evaluated with care.', support: ['Name who the work is for', 'Ask what changes if the decision is wrong'] },
  { label: 'The eight-step cycle', letter: '', title: 'Move the lens into a repeatable rhythm.', body: 'PRIMER becomes concrete when a task moves from planning through research, collaboration, engagement, presentation, feedback, application, and reflection.', cycle: ['Plan / prepare / propose', 'Research', 'Collaboration', 'Engagement', 'Presentation', 'Feedback loop', 'Application', 'Reflect'] },
  { label: 'Why it matters here', letter: '', title: 'One vocabulary across three tables.', body: 'The same six qualities can guide curriculum, workplace use, and the training and policy that North Harris brings to the system-level meeting.', support: ['Table 1: student readiness', 'Table 2: governance and tools', 'Table 3: training, consistency, and metrics'] }
];

const tableData = {
  curriculum: {
    number: '01', short: 'Curriculum', title: 'Curriculum, assignments & student AI readiness',
    description: 'Design assignments that protect learning while preparing students for ethical AI use in the careers they are entering.',
    merges: 'The PRIMER assignment-design table with AI ethics, workforce readiness, and discipline representation.',
    covers: 'AI-resistant assignments, ethical fluency, disability access, and examples from each division.',
    deliverable: '3 redesigned assignment examples + one AI / ethics literacy recommendation',
    prompts: [
      'Which parts of PRIMER are already used informally in your discipline, and what would an AI-resistant version of one assignment look like?',
      'What is our responsibility to prepare students for a workforce where AI fluency is expected?',
      'Where does AI help students learn versus let them skip learning, and where could it support students with disabilities?',
      'What is one discipline-specific example from your division?'
    ]
  },
  workplace: {
    number: '02', short: 'Workplace', title: 'Workplace use, governance & tools',
    description: 'Name useful, bounded applications while protecting privacy, human judgment, trust, and staff workload.',
    merges: 'The workplace AI-use table with governance, privacy, approved tools, budget, and workload-related gaps.',
    covers: 'Grading assistance, curriculum support, personalized paths, research, analytics, student interaction, and conflict resolution.',
    deliverable: '3–5 use cases to pilot + an approved-tools list with minimum data-handling rules',
    prompts: [
      'Which AI use cases are already happening informally, and what would they realistically save?',
      'Which tools are approved institution-wide versus used informally, and how is confidential data protected today?',
      'Where is human judgment non-negotiable, regardless of the tool?',
      'What is realistic on budget and licensing, and how do we address workload or job-security concerns?'
    ]
  },
  training: {
    number: '03', short: 'Follow-up', title: 'Training, policy consistency & follow-up',
    description: 'Turn uneven familiarity into a phased plan with shared expectations and a small set of useful measures.',
    merges: 'The training and equity table with metrics, follow-up, academic-integrity consistency, and faculty competency gaps.',
    covers: 'Access, cross-college consistency, dual-credit partners, training that gets used, and named owners for KPIs.',
    deliverable: 'Phased training plan + consistent-policy recommendation + 3–5 KPIs with a named owner',
    prompts: [
      'What is the current AI-familiarity gap across the LSC colleges, and what training format would actually get used?',
      'Where do students or staff lack equal access, and how do we keep academic-integrity rules consistent?',
      'What should we measure, how often, and who owns it?'
    ]
  }
};

const defaultActions = [
  { id: 'action-1', text: 'Consolidated one-page proposal drafted', owner: 'Assign', date: 'Fill in', status: 'Open' },
  { id: 'action-2', text: 'Proposal reviewed by North Harris leadership', owner: 'Assign', date: 'Fill in', status: 'Open' },
  { id: 'action-3', text: 'Proposal carried to the system-level meeting across the LSC colleges', owner: 'Assign', date: 'Fill in', status: 'Open' }
];

const defaultState = {
  version: 1,
  savedAt: null,
  tables: { curriculum: [], workplace: [], training: [] },
  actions: defaultActions,
  files: [],
  resources: [{ id: 'source-doc', name: 'AI in Education & Workplace — North Harris Working Session', url: SOURCE_DOC_URL, kind: 'Google Doc', createdAt: 'September 22, 2026' }]
};

let state = loadLocalState();
let activeTable = 'curriculum';
let primerIndex = 0;
let cloudAvailable = false;
let persistenceProvider = 'local';
let toastTimer;
const saves = createSaveQueue(
  async (action) => {
    setSync('saving', 'Saving…');
    return requestCloud('/api/state', { method: 'POST', body: JSON.stringify(action) });
  },
  (result) => {
    if (result?.tables) state = mergeAppendOnlyState(normalizeState(result), state);
    persistenceProvider = result.persistence?.provider || persistenceProvider;
    saveLocal();
    setSync('cloud', persistenceProvider === 'github' ? 'GitHub saved' : 'Shared cloud');
    renderAll();
  },
  () => {
    setSync('error', 'Cloud save failed');
    showToast('Saved locally. Keep this tab open; the next change retries the pending shared save.');
  }
);

const $ = (selector) => root.querySelector(selector);
const $$ = (selector) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const nowIso = () => new Date().toISOString();
const formatDate = (iso) => iso ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso)) : 'Not yet saved';
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY));
    return saved ? normalizeState(saved) : structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}

function normalizeState(saved) {
  const next = structuredClone(defaultState);
  return {
    ...next,
    ...saved,
    tables: { ...next.tables, ...(saved.tables || {}) },
    actions: Array.isArray(saved.actions) && saved.actions.length ? saved.actions : next.actions,
    files: Array.isArray(saved.files) ? saved.files : [],
    resources: Array.isArray(saved.resources) && saved.resources.length ? saved.resources : next.resources
  };
}

function saveLocal() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch { showToast('Browser storage is full. Download an artifact to keep a copy.'); }
}

function setSync(status, label) {
  const statusEl = $('#syncStatus');
  statusEl.dataset.status = status;
  $('#syncLabel').textContent = label;
}

async function requestCloud(path, options = {}) {
  const response = await fetch(path, { signal: lifecycle.signal, ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function syncFromCloud() {
  try {
    const result = await requestCloud('/api/state');
    if (disposed) return;
    if (result && result.tables) {
      state = mergeAppendOnlyState(normalizeState(result), state);
      cloudAvailable = true;
      persistenceProvider = result.persistence?.provider || 'netlify-blobs';
      saveLocal();
      setSync('cloud', persistenceProvider === 'github' ? 'GitHub synced' : 'Shared cloud');
      renderAll();
      return;
    }
  } catch { /* Static local preview is expected before Netlify deployment. */ }
  if (!disposed) setSync('local', 'Local draft');
}

function queueCloudSave(action) {
  if (!cloudAvailable) return;
  void saves.enqueue(action);
}

function commit(action) {
  state.savedAt = nowIso();
  saveLocal();
  queueCloudSave(action);
  renderAll();
}

function renderAll() {
  renderMetrics();
  renderTableCards();
  renderPrimer();
  renderTableTabs();
  renderActiveTable();
  renderActions();
  renderArtifacts();
}

function renderMetrics() {
  const contributionCount = Object.values(state.tables).reduce((sum, entries) => sum + entries.length, 0);
  $('#heroContributionCount').textContent = String(contributionCount).padStart(2, '0');
  const metrics = [
    [Object.keys(tableData).length, 'working tables'],
    [6, 'PRIMER qualities'],
    [8, 'cycle steps'],
    [contributionCount, 'saved contributions']
  ];
  $('#metricGrid').innerHTML = metrics.map(([value, label]) => `<div class="metric"><span class="metric-value">${value}</span><span class="metric-label">${label}</span></div>`).join('');
}

function renderTableCards() {
  $('#tableCardGrid').innerHTML = Object.entries(tableData).map(([key, table]) => {
    const count = state.tables[key].length;
    const progress = Math.min(100, count * 18);
    return `<article class="table-card"><div class="table-card-top"><div><div class="table-index">TABLE ${table.number}</div><h3>${escapeHtml(table.title)}</h3><p>${escapeHtml(table.description)}</p></div></div><div class="table-card-bottom"><div class="progress-copy"><strong>${count}</strong> saved notes</div><div><div class="mini-progress"><span style="width:${progress}%"></span></div><button class="text-link" data-table-open="${key}" type="button">Open workspace ↗</button></div></div></article>`;
  }).join('');
  $$('[data-table-open]').forEach((button) => listen(button, 'click', () => { activeTable = button.dataset.tableOpen; navigateTo('tables'); renderTableTabs(); renderActiveTable(); }));
}

function renderPrimer() {
  const slide = primerSlides[primerIndex];
  $('#primerSlideLabel').textContent = `${String(primerIndex + 1).padStart(2, '0')} / ${String(primerSlides.length).padStart(2, '0')}`;
  $('#primerProgress').style.width = `${((primerIndex + 1) / primerSlides.length) * 100}%`;
  const letter = slide.letter ? `<span class="slide-letter">${slide.letter}</span>` : '';
  const author = slide.author ? `<p class="slide-author">${escapeHtml(slide.author)}</p>` : '';
  const support = slide.support ? `<div class="slide-support">${slide.support.map(item => `<div class="slide-support-item">${escapeHtml(item)}</div>`).join('')}</div>` : '';
  const cycle = slide.cycle ? `<div class="cycle-grid">${slide.cycle.map((item, index) => `<div class="cycle-step"><strong>${String(index + 1).padStart(2, '0')}</strong><span>${escapeHtml(item)}</span></div>`).join('')}</div>` : '';
  $('#primerSlide').innerHTML = `<div class="slide-kicker">${letter}<span>${escapeHtml(slide.label)}</span></div><h3>${escapeHtml(slide.title)}</h3><p>${escapeHtml(slide.body)}</p>${author}${support}${cycle}`;
  $('#primerPrintOnly').innerHTML = primerSlides.map((item, index) => `<article><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${escapeHtml(item.label)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p>${item.author ? `<p class="print-slide-author">${escapeHtml(item.author)}</p>` : ''}</article>`).join('');
}

function renderTableTabs() {
  $('#tableTabs').innerHTML = Object.entries(tableData).map(([key, table]) => `<button class="table-tab ${activeTable === key ? 'is-active' : ''}" data-table-tab="${key}" role="tab" aria-selected="${activeTable === key}">Table ${table.number} · ${escapeHtml(table.short)}</button>`).join('');
  $$('[data-table-tab]').forEach((button) => listen(button, 'click', () => { activeTable = button.dataset.tableTab; renderTableTabs(); renderActiveTable(); }));
}

function renderActiveTable() {
  const table = tableData[activeTable];
  const entries = state.tables[activeTable];
  $('#tableContext').innerHTML = `<div class="context-label">Table ${table.number}</div><h3>${escapeHtml(table.title)}</h3><p>${escapeHtml(table.description)}</p><div class="context-block"><strong>Built from</strong><p>${escapeHtml(table.merges)}</p></div><div class="context-block"><strong>Deliverable</strong><p>${escapeHtml(table.deliverable)}</p></div>`;
  $('#promptList').innerHTML = table.prompts.map((prompt, index) => `<div class="prompt-item"><span class="prompt-marker">${index + 1}</span><p>${escapeHtml(prompt)}</p></div>`).join('');
  $('#contributionTableKey').value = activeTable;
  $('#contributionPrompt').innerHTML = table.prompts.map((prompt, index) => `<option value="${index}">Prompt ${index + 1}: ${escapeHtml(prompt.slice(0, 65))}${prompt.length > 65 ? '…' : ''}</option>`).join('');
  $('#savedContributionTitle').textContent = `Table ${table.number} notes`;
  $('#savedContributionCount').textContent = entries.length;
  if (!entries.length) {
    $('#contributionList').innerHTML = `<div class="contribution-empty">No contributions yet. Add the first note while the group is talking.</div>`;
  } else {
    $('#contributionList').innerHTML = [...entries].reverse().map(entry => `<article class="contribution-row"><div><p>${escapeHtml(entry.text)}</p><div class="row-meta"><span>${escapeHtml(entry.contributor || 'Anonymous')}</span><span>${escapeHtml(entry.role || 'Role not specified')}</span><span>Prompt ${Number(entry.promptIndex) + 1}</span><span>${formatDate(entry.createdAt)}</span></div></div><span class="signal-badge" data-signal="${escapeHtml(entry.signal)}">${escapeHtml(entry.signal)}</span></article>`).join('');
  }
}

function renderActions() {
  $('#actionBoard').innerHTML = state.actions.map(action => `<div class="action-row"><p>${escapeHtml(action.text)}</p><div class="action-meta"><strong>Owner</strong>${escapeHtml(action.owner || 'Assign')}</div><div class="action-meta"><strong>Target date</strong>${escapeHtml(action.date || 'Fill in')}</div><span class="action-state">${escapeHtml(action.status || 'Open')}</span></div>`).join('');
}

function renderArtifacts() {
  const items = [...state.resources.map(item => ({ ...item, type: 'Source link' })), ...state.files.map(item => ({ ...item, type: item.kind || 'File' }))];
  if (!items.length) { $('#artifactList').innerHTML = '<div class="artifact-empty">No saved artifacts yet. Add a handoff, upload a file, or save the source link.</div>'; return; }
  $('#artifactList').innerHTML = items.map(item => {
    const isResource = Boolean(item.url);
    const action = isResource ? `<a class="artifact-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open source ↗</a>` : `<button class="button button-outline" data-download-file="${escapeHtml(item.id)}" type="button">Download file</button>`;
    return `<article class="artifact-item"><span class="artifact-type">${escapeHtml(item.type)}</span><h3>${escapeHtml(item.name)}</h3><p>${isResource ? escapeHtml(item.createdAt || 'Shared source') : `${escapeHtml(item.mimeType || 'File')} · ${formatBytes(item.size)}`}</p>${action}</article>`;
  }).join('');
  $$('[data-download-file]').forEach(button => listen(button, 'click', () => downloadFile(button.dataset.downloadFile)));
}

function navigateTo(target) {
  const element = document.getElementById(target);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $$('.nav-link').forEach(link => link.classList.toggle('is-active', link.dataset.viewTarget === target));
}

function showToast(message) {
  if (disposed) return;
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function getContributor() { return $('#contributorName').value.trim() || 'Anonymous'; }

function handleContributionSubmit(event) {
  event.preventDefault();
  const text = $('#contributionText').value.trim();
  if (!text) return;
  const entry = { id: uid('entry'), text, contributor: getContributor(), role: $('#contributionRole').value.trim(), signal: $('#contributionSignal').value, promptIndex: Number($('#contributionPrompt').value), createdAt: nowIso() };
  state.tables[activeTable].push(entry);
  $('#contributionText').value = '';
  $('#contributionRole').value = '';
  $('#contributionStatus').textContent = 'Saved to the table.';
  commit({ action: 'add-entry', tableKey: activeTable, entry });
  showToast('Contribution saved.');
  setTimeout(() => { if (!disposed) $('#contributionStatus').textContent = ''; }, 2200);
}

function handleActionSubmit(event) {
  event.preventDefault();
  const action = { id: uid('action'), text: $('#actionText').value.trim(), owner: $('#actionOwner').value.trim() || 'Assign', date: $('#actionDate').value.trim() || 'Fill in', status: 'Open' };
  if (!action.text) return;
  state.actions.push(action);
  $('#actionForm').reset();
  $('#actionForm').classList.add('hidden');
  commit({ action: 'add-action', item: action });
  showToast('Action added to the board.');
}

function makeArtifactContent(name, format, content) {
  const safeName = name || 'north-harris-ai-task-force-notes';
  if (format === 'md' && !safeName.endsWith('.md')) return { name: `${safeName}.md`, mimeType: 'text/markdown', content };
  if (format === 'txt' && !safeName.endsWith('.txt')) return { name: `${safeName}.txt`, mimeType: 'text/plain', content };
  if (format === 'doc') {
    const docBody = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(safeName)}</title></head><body><h1>${escapeHtml(safeName.replace(/\.doc$/i, ''))}</h1><p>${escapeHtml(content).replace(/\n/g, '<br>')}</p></body></html>`;
    return { name: safeName.endsWith('.doc') ? safeName : `${safeName}.doc`, mimeType: 'application/msword', content: docBody };
  }
  return { name: safeName, mimeType: 'text/plain', content };
}

function toBase64(buffer) { let binary = ''; const bytes = new Uint8Array(buffer); const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk)); return btoa(binary); }
function fromBase64(base64) { const binary = atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes; }
function formatBytes(bytes = 0) { if (!bytes) return '0 KB'; const units = ['B', 'KB', 'MB', 'GB']; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`; }

async function handleArtifactSubmit(event) {
  event.preventDefault();
  const artifact = makeArtifactContent($('#artifactName').value.trim(), $('#artifactFormat').value, $('#artifactContent').value);
  const file = { id: uid('file'), name: artifact.name, mimeType: artifact.mimeType, size: new Blob([artifact.content]).size, kind: artifact.mimeType === 'application/msword' ? 'Word-compatible' : artifact.mimeType === 'text/markdown' ? 'Markdown' : 'Text file', createdAt: nowIso(), createdBy: getContributor(), localContentBase64: toBase64(new TextEncoder().encode(artifact.content)) };
  state.files.push(file);
  saveLocal();
  renderArtifacts();
  $('#artifactStatus').textContent = cloudAvailable ? 'Uploading artifact…' : 'Artifact saved locally.';
  if (cloudAvailable) {
    setSync('saving', 'Uploading…');
    try {
      await requestCloud('/api/file', { method: 'POST', body: JSON.stringify({ id: file.id, name: file.name, mimeType: file.mimeType, contentBase64: file.localContentBase64 }) });
      const { localContentBase64, ...metadata } = file;
      if (disposed) return;
      commit({ action: 'add-file', file: metadata });
      $('#artifactStatus').textContent = 'File uploaded; shared metadata save queued.';
    } catch {
      setSync('error', 'Artifact saved locally');
      if (disposed) return;
      $('#artifactStatus').textContent = 'Saved locally. Download a copy; re-create the artifact to retry uploading.';
    }
  } else {
    commit({ action: 'add-file', file: { ...file, localContentBase64: undefined } });
  }
  showToast('Text artifact saved.');
}

async function handleFileUpload(event) {
  const selected = event.target.files?.[0];
  if (!selected) return;
  if (selected.size > FILE_LIMIT_BYTES) { showToast('Please keep uploads under 5 MB for this workspace.'); event.target.value = ''; return; }
  const buffer = await selected.arrayBuffer();
  const file = { id: uid('file'), name: selected.name, mimeType: selected.type || 'application/octet-stream', size: selected.size, kind: selected.type?.includes('word') || /\.docx?$/i.test(selected.name) ? 'Word file' : selected.type?.startsWith('text/') || /\.(txt|md|csv|html|json)$/i.test(selected.name) ? 'Text file' : 'Uploaded file', createdAt: nowIso(), createdBy: getContributor(), localContentBase64: toBase64(buffer) };
  state.files.push(file);
  saveLocal();
  renderArtifacts();
  if (cloudAvailable) {
    setSync('saving', 'Uploading…');
    try {
      await requestCloud('/api/file', { method: 'POST', body: JSON.stringify({ id: file.id, name: file.name, mimeType: file.mimeType, contentBase64: file.localContentBase64 }) });
      const { localContentBase64, ...metadata } = file;
      if (disposed) return;
      commit({ action: 'add-file', file: metadata });
    } catch { if (disposed) return; setSync('error', 'Upload saved locally'); showToast('The file is saved in this browser. Re-upload it to retry the shared upload.'); }
  }
  event.target.value = '';
  showToast(`${file.name} added to artifacts.`);
}

function handleAddResource() {
  const url = $('#resourceUrl').value.trim();
  if (!url) return;
  let validUrl; try { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol'); validUrl = parsed.toString(); } catch { showToast('Enter a valid web or Google Drive URL.'); return; }
  const resource = { id: uid('resource'), name: $('#resourceLabel').value.trim() || 'Shared source link', url: validUrl, kind: validUrl.includes('docs.google.com') ? 'Google Doc' : 'Source link', createdAt: nowIso() };
  state.resources.push(resource);
  $('#resourceUrl').value = ''; $('#resourceLabel').value = '';
  commit({ action: 'add-resource', resource });
  showToast('Source link saved.');
}

async function downloadFile(id) {
  const file = state.files.find(item => item.id === id);
  if (!file) return;
  let bytes;
  if (file.localContentBase64) bytes = fromBase64(file.localContentBase64);
  else if (cloudAvailable) {
    try { const response = await fetch(`/api/file?id=${encodeURIComponent(id)}`); if (!response.ok) throw new Error('download failed'); bytes = new Uint8Array(await response.arrayBuffer()); }
    catch { showToast('The shared file could not be downloaded right now.'); return; }
  }
  if (!bytes) { showToast('This file has no local preview.'); return; }
  const blob = new Blob([bytes], { type: file.mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url);
}

function toggleTheme() {
  const isNight = document.body.classList.toggle('night');
  try { localStorage.setItem('north-harris-theme', isNight ? 'night' : 'day'); } catch { /* Keep the current theme in memory. */ }
  $('#themeToggle').textContent = isNight ? '☀' : '☾';
  $('#themeToggle').setAttribute('aria-label', isNight ? 'Switch to day mode' : 'Switch to night mode');
  $('#themeToggle').title = isNight ? 'Switch to day mode' : 'Switch to night mode';
}

function handlePrimerKey(event) { if (event.key === 'Escape' && document.body.classList.contains('presentation-mode')) { document.body.classList.remove('presentation-mode'); return; } if (!document.body.classList.contains('presentation-mode')) return; if (event.key === 'ArrowRight') { primerIndex = Math.min(primerSlides.length - 1, primerIndex + 1); renderPrimer(); } if (event.key === 'ArrowLeft') { primerIndex = Math.max(0, primerIndex - 1); renderPrimer(); } }

function init() {
  let savedTheme;
  try { savedTheme = localStorage.getItem('north-harris-theme'); } catch { /* Storage may be disabled. */ }
  if (savedTheme === 'night') { document.body.classList.add('night'); $('#themeToggle').textContent = '☀'; $('#themeToggle').setAttribute('aria-label', 'Switch to day mode'); }
  $$('.nav-link, [data-view-target]').forEach(button => listen(button, 'click', () => navigateTo(button.dataset.viewTarget)));
  listen($('#themeToggle'), 'click', toggleTheme);
  listen($('#printButton'), 'click', () => window.print());
  listen($('#primerPrintButton'), 'click', () => window.print());
  listen($('#primerPrev'), 'click', () => { primerIndex = Math.max(0, primerIndex - 1); renderPrimer(); });
  listen($('#primerNext'), 'click', () => { primerIndex = Math.min(primerSlides.length - 1, primerIndex + 1); renderPrimer(); });
  listen($('#presentPrimerButton'), 'click', () => { document.body.classList.add('presentation-mode'); navigateTo('primer'); });
  listen($('#contributionForm'), 'submit', handleContributionSubmit);
  listen($('#actionForm'), 'submit', handleActionSubmit);
  listen($('#addActionButton'), 'click', () => { $('#actionForm').classList.toggle('hidden'); $('#actionText').focus(); });
  listen($('#artifactForm'), 'submit', handleArtifactSubmit);
  listen($('#fileInput'), 'change', handleFileUpload);
  listen($('#addResourceButton'), 'click', handleAddResource);
  listen(window, 'keydown', handlePrimerKey);
  renderAll();
  syncFromCloud();
}

init();
return () => {
  disposed = true;
  lifecycle.abort();
  saves.dispose();
  clearTimeout(toastTimer);
  document.body.classList.remove('presentation-mode');
};
}


