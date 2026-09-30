const repository = process.env.GITHUB_REPOSITORY || 'victogarcia4/proposal-for-ai-taskforce-nh';
const [owner, repo] = repository.split('/');

export const githubConfig = {
  configured: Boolean(process.env.GITHUB_TOKEN && owner && repo),
  owner,
  repo,
  branch: process.env.GITHUB_BRANCH || 'main',
  repository,
  statePath: process.env.GITHUB_STATE_PATH || 'data/dashboard-state.json',
  filesPath: process.env.GITHUB_FILES_PATH || 'data/files'
};

function contentPath(path) {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

export async function githubRequest(path, options = {}) {
  if (!githubConfig.configured) throw new Error('GitHub persistence is not configured.');
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'north-harris-ai-task-force-dashboard',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed with status ${response.status}.`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function readGithubFile(path) {
  try {
    return await githubRequest(`/repos/${owner}/${repo}/contents/${contentPath(path)}?ref=${encodeURIComponent(githubConfig.branch)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function writeGithubFile(path, contentBase64, message, sha = null) {
  const body = {
    message,
    branch: githubConfig.branch,
    content: contentBase64
  };
  if (sha) body.sha = sha;
  return githubRequest(`/repos/${owner}/${repo}/contents/${contentPath(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export function encodeBase64(value) {
  return Buffer.isBuffer(value) ? value.toString('base64') : Buffer.from(value, 'utf8').toString('base64');
}


