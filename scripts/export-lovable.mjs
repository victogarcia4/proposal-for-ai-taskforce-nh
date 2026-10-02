import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Allowlist only application source/configuration. Never copy .git, local data,
// .env files, credentials, node_modules, or deployment/build caches.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = join(root, 'handoff', `lovable-${stamp}`);
const files = [
  'src', 'public', 'netlify', 'scripts', 'tests', 'legacy', 'database', 'supabase', 'reporting',
  'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts',
  'netlify.toml', '.nvmrc', '.gitignore', '.env.example', 'README.md',
  'LOVABLE_IMPORT_GUIDE.md', 'LOVABLE_PROJECT_KNOWLEDGE.md',
  'VERIFICATION.md', 'IMPLEMENTATION.md', 'AI_Policy_Application_Plan_v2.md',
  'AI_Policy_Application_Plan.md', 'AI_Policy_Application_Lovable_Backup_Plan.md',
];
await mkdir(destination, { recursive: true });
const filter = source => relative(root, source).split(sep).every(segment =>
  !['.git', '.netlify', '.tanstack', '.temp', 'node_modules', 'dist', 'data'].includes(segment)
  && (!segment.startsWith('.env') || segment === '.env.example')
);
for (const item of files) await cp(join(root, item), join(destination, item), { recursive: true, errorOnExist: true, force: false, filter });
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
await writeFile(join(destination, 'HANDOFF_MANIFEST.json'), JSON.stringify({
  createdAt: new Date().toISOString(), application: pkg.name, version: pkg.version,
  sourceFiles: files, excluded: ['.git', '.env* except .env.example', 'data', 'node_modules', 'dist', '.netlify', '.tanstack'],
  instruction: 'Transfer files into the repository CREATED BY LOVABLE. Preserve its .git directory and Lovable connection metadata. See LOVABLE_IMPORT_GUIDE.md. This is not a native Lovable import archive.',
}, null, 2) + '\n');
console.log(`Prepared handoff: ${relative(root, destination)}`);
