# North Harris AI Task Force dashboard

Static HTML, CSS, and vanilla JavaScript dashboard built from the Google Doc **AI in Education & Workplace - North Harris Working Session**.

## Run locally

Open `index.html` for a browser-only preview. Contributions and artifacts are saved in the current browser with `localStorage`.

For the shared multi-user version, deploy this folder to Netlify. Netlify will expose the two functions in `netlify/functions/` and the `/api/state` and `/api/file` routes defined in `netlify.toml`.

## GitHub-backed saving

This repository is configured for `victogarcia4/proposal-for-ai-taskforce-nh` on the `main` branch. When the following Netlify environment variables are set, the dashboard commits shared changes to GitHub:

- `GITHUB_TOKEN` — a fine-grained token with Contents read/write access to this repository. Store it only in Netlify environment variables; never place it in browser code.
- `GITHUB_REPOSITORY` — optional; defaults to `victogarcia4/proposal-for-ai-taskforce-nh`.
- `GITHUB_BRANCH` — optional; defaults to `main`.
- `GITHUB_STATE_PATH` — optional; defaults to `data/dashboard-state.json`.
- `GITHUB_FILES_PATH` — optional; defaults to `data/files`.

Each table contribution, action, source link, and artifact metadata update creates a GitHub commit. Uploaded files are committed under `data/files/`. The function retries state saves when two users submit at nearly the same time. If `GITHUB_TOKEN` is not configured, the deployed app falls back to Netlify Blobs and a browser-only preview continues to use `localStorage`.

The app cannot safely commit arbitrary source-code edits made inside a browser. Source changes to HTML, CSS, JavaScript, or Netlify Functions should be made through GitHub or the normal local Git workflow; user-generated dashboard content is the part committed automatically by the deployed app.

## Included

- Day and night theme toggle.
- Overview of the three breakout tables and live contribution counts.
- Presentation-style PRIMER section with slide controls, keyboard navigation, and presentation mode.
- Shared contribution forms for curriculum, workplace, and training / follow-up tables.
- Action board based on the source document's closing next steps.
- Text artifact creator for Markdown, plain text, and Word-compatible `.doc` files.
- File upload support for supporting files up to 5 MB.
- Google Doc / source-link saving.
- Browser Print / PDF flow with print CSS.
- GitHub commit persistence for shared dashboard changes and uploaded files when configured in Netlify.

