# North Harris AI Task Force dashboard

React + TypeScript + TanStack Start application, prepared for continued editing through Lovable's GitHub sync and deployment on Netlify. The dashboard retains the content of **AI in Education & Workplace — North Harris Working Session** and Kayla Almaguer's PRIMER attribution.

**Prototype, not an approved institutional policy system.** The existing shared-content endpoints do not authenticate participants or enforce institutional roles. Do not collect confidential, student, personnel, or sensitive institutional data. Authentication, authorization, relational storage, analysis, and Power BI are future work in the plans below. A successful build does not constitute security or OTS approval.

## Planning documents

- [Primary application plan](AI_Policy_Application_Plan.md) — research, existing-question audit, proposed six tables and twenty-four questions, database, analysis, and Power BI.
- [Lovable backup plan](AI_Policy_Application_Lovable_Backup_Plan.md) — the same product goals through an alternative development workflow.
- [Lovable transfer and Netlify deployment guide](LOVABLE_IMPORT_GUIDE.md) — practical steps for this repository.
- [Lovable project knowledge](LOVABLE_PROJECT_KNOWLEDGE.md) — constraints to provide to the Lovable editor.

## Run locally

Use Node.js 24 (the repository also requires at least Node 22.12). From the repository root:

```sh
npm ci
npm run dev
```

Open the local address shown by the development server, normally `http://127.0.0.1:3000`. Browser drafts retain the original local-storage key. Standard previews use local-draft mode without requiring a Netlify account. To opt into Netlify's local function/platform emulation, use `npm run dev:netlify`; this is not a deployed shared database and may require additional runtime permissions/configuration.

```sh
npm run check
npm run export:lovable
```

`check` builds both browser and server bundles, checks TypeScript, and runs persistence regression tests. The export command creates a timestamped, ignored `handoff/lovable-*` source folder without Git history, secrets, deployment caches, or user-generated `data/`. It is a transfer package, **not** a native Lovable import file.

## Deploy to Netlify

Connect the repository and intended branch using Netlify's Git-based deployment. The checked-in configuration sets:

- Build command: `npm run build`.
- Publish directory: `dist/client`.
- Functions directory: `netlify/functions`.
- Node version: `24`.

The official TanStack Start adapter builds the server-rendering function automatically. Keep the explicit `/api/state` and `/api/file` redirects. Do not add an SPA `/* → /index.html` redirect; this application has a server-rendered entry point. Do not publish the repository root or upload only `dist/client` with a static drag-and-drop deployment: that omits the server and shared-content functions.

Before using a deployed preview, verify the checklist in the transfer guide. Restrict preview access, or use only synthetic/demo content until the institutional security work is completed.

## Architecture and preserved source

- `src/routes/` and `src/router.tsx`: TanStack routing and server-rendered document.
- `src/components/Dashboard.tsx`: editable React/TypeScript dashboard shell.
- `src/lib/dashboard-controller.mjs`: preserved browser interaction logic, mounted after hydration with cleanup on unmount.
- `src/lib/persistence.mjs`: serialized saves and append-only response merging.
- `src/styles.css` and `public/`: existing visual design and assets, with build-safe asset paths.
- `netlify/functions/`: existing GitHub / Netlify Blobs persistence.
- `legacy/`: original standalone HTML/CSS/JavaScript retained for comparison and rollback.

This is a compatibility migration, not a complete rewrite of the dashboard as React stateful components. React owns the shell; the controller owns its empty dynamic containers. Preserve that boundary until it is intentionally replaced. Do not attach competing React handlers to the existing forms. The current three tables and eleven questions are unchanged; the six-table consultation remains a separate implementation phase.

## GitHub-backed saving

The optional persistence target defaults to `victogarcia4/proposal-for-ai-taskforce-nh` on `main`. Set the following **server-only Netlify function environment variables** to enable GitHub persistence:

- `GITHUB_TOKEN` — a fine-grained token with Contents read/write access to this repository. Store it only in Netlify environment variables; never place it in browser code.
- `GITHUB_REPOSITORY` — optional; defaults to `victogarcia4/proposal-for-ai-taskforce-nh`.
- `GITHUB_BRANCH` — optional; defaults to `main`.
- `GITHUB_STATE_PATH` — optional; defaults to `data/dashboard-state.json`.
- `GITHUB_FILES_PATH` — optional; defaults to `data/files`.

If `GITHUB_TOKEN` is unset, the deployed app uses Netlify Blobs. Never prefix secrets with `VITE_`, store them in Lovable knowledge, or commit an `.env` file. `.env.example` contains only commented placeholders. If transferring to a new repository, explicitly choose `GITHUB_REPOSITORY`; otherwise the original repository remains the default data target. Do not reuse a token granting unnecessary source-repository access.

Each shared change can create a GitHub commit; uploads are saved under `data/files/`. GitHub state writes retry conflicts. Netlify Blobs still uses a whole-state read/modify/write approach and is not a substitute for transaction-safe relational storage for the planned consultation. Browser save queues now preserve rapid edits within a tab, but do not solve server-side multi-user concurrency. Local-only changes and failed uploads are not automatically migrated to the cloud after a reload. Download important artifacts and verify the shared record before treating it as submitted.

Lovable edits source code through its connected GitHub repository. The dashboard's data-saving functions are a separate mechanism; they do not deploy or modify application source.

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

## Current platform references

Checked October 1, 2026: Lovable does not offer native import of an arbitrary existing repository; its integration creates a new linked repository, then syncs changes from the active branch. New Lovable projects use TanStack Start. See [Lovable GitHub integration](https://docs.lovable.dev/integrations/github), [Lovable TanStack Start announcement](https://lovable.dev/blog/building-apps-using-tanstack-start), and [Netlify's TanStack Start adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/).

