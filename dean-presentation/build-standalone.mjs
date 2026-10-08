import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const [htmlSource, cssSource, jsSource] = await Promise.all([
  readFile(resolve(folder, 'index.html'), 'utf8'),
  readFile(resolve(folder, 'styles.css'), 'utf8'),
  readFile(resolve(folder, 'app.js'), 'utf8'),
]);

let html = htmlSource
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${cssSource}\n</style>`)
  .replace('<script src="app.js"></script>', `<script>\n${jsSource}\n</script>`);

for (const asset of ['app-email-entry.png', 'app-profile.png', 'app-working-tables.png', 'app-proposals.png', 'app-my-contributions.png', 'dr-victor-garcia-m.png']) {
  const bytes = await readFile(resolve(folder, 'assets', asset));
  const encoded = `data:image/png;base64,${bytes.toString('base64')}`;
  html = html.replaceAll(`assets/${asset}`, encoded);
}

const destination = resolve(folder, 'North_Harris_Dean_Presentation.html');
await writeFile(destination, html, 'utf8');
process.stdout.write(`${destination}\n`);
