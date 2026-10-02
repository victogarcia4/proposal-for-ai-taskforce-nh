# Lovable Transfer and Netlify Deployment Guide

Date: October 1, 2026  
Scope: Prepare the existing three-table working-session dashboard for platform portability. This does not implement the six-table institutional consultation in the planning documents.

## Important: what is and is not possible

Lovable's current GitHub integration **does not natively import an existing repository**. Supplying `https://github.com/victogarcia4/proposal-for-ai-taskforce-nh.git` is not a supported direct-import operation. Lovable creates a new repository when a project is connected; later changes pushed to its active branch can sync back to the editor. [Official GitHub integration documentation](https://docs.lovable.dev/integrations/github).

This repository is now prepared for a **manual source transfer into that new linked repository**, using React, TypeScript, and TanStack Start. This follows Lovable's current application stack, but is not a guarantee that a particular Lovable workspace will accept every build setting unchanged. The local build can be verified here; the actual Lovable preview and sync must be verified after a project is linked. [Lovable's TanStack Start announcement](https://lovable.dev/blog/building-apps-using-tanstack-start).

No Lovable project, new GitHub repository, Netlify site, credentials, or production deployment was created by this preparation work.

## 1. Verify and package the local repository

Use Node.js 24 and run:

```sh
npm ci
npm run check
npm run export:lovable
```

The final command creates a new `handoff/lovable-<timestamp>/` folder and `HANDOFF_MANIFEST.json`. It copies an explicit list of source/configuration/documentation files. It excludes `.git`, `.env` secrets, `node_modules`, build output, deployment caches, and user-generated `data/`. `.env.example` is safe to transfer because it contains commented placeholders only. Inspect the package before sharing it; source files and public assets are still institutional/project material, not automatically authorized for any external service.

## 2. Create the Lovable destination

1. Create a new Lovable project in the authorized workspace. Ask for an English React/TypeScript/TanStack Start project with no new database, generated AI features, or proprietary backend bindings yet.
2. Connect GitHub from the project settings. Let Lovable create its new linked repository. Do not rename or move that repository after connecting it.
3. Record the repository URL and the branch selected in Lovable. Stop other Lovable editing while transferring files so edits do not race.
4. Clone that new repository into a **different folder**. Keep its `.git` directory and any Lovable connection metadata such as `.lovable/` unchanged. Make a backup commit or branch of the generated starter before modifying it.

Suggested initial prompt:

> Create an English North Harris AI Task Force dashboard using React, TypeScript, and TanStack Start. I will transfer an existing application through this project's GitHub-connected repository. Keep the project compatible with Netlify's official TanStack Start adapter. Do not create a database, authentication, Cloudflare-specific secrets, paid services, or AI-generation features. Wait for the transferred files before redesigning the app.

## 3. Transfer source without replacing repository identity

1. Copy the exported application folders and files into the new clone: `src/`, `public/`, `netlify/`, `scripts/`, `tests/`, `legacy/`, the package files, Vite/TypeScript/Netlify configuration, documentation, `.gitignore`, `.nvmrc`, and `.env.example`.
2. Review destination starter conflicts explicitly. The supplied `vite.config.ts`, `package.json`, and lockfile are one compatible set. Do not combine them with an old Cloudflare-only or static-Vite-only starter without adapting the configuration.
3. Keep the original starter backup. Remove or relocate only confirmed obsolete starter entry points if they interfere with this application's routing/build. Do not delete destination `.git`, Lovable metadata, secrets, or unrelated files. Do not copy the source repository's `.git` directory.
4. Run `npm ci` and `npm run check` in the destination clone. Review the complete change set.
5. Commit the transfer and push normally to the branch selected in Lovable, or merge a reviewed transfer branch and select that branch in Lovable. Do not force-push or replace destination Git history.
6. Open Lovable and confirm the sync completed. If it fails, inspect the sync/build error before asking the editor to regenerate files.

Suggested prompt after sync:

> Review LOVABLE_PROJECT_KNOWLEDGE.md and both English planning documents. The transferred application has a React shell with a browser-only compatibility controller. Preserve the three tables, eleven questions, nine PRIMER slides, Kayla Almaguer attribution, themes, printing, actions, artifacts, and original local-storage key. Verify the preview and report build or hydration problems before changing the design. Keep Netlify as the deployment target. Do not implement the six-table redesign, authentication, database, or Power BI until I approve that implementation phase.

## 4. Understand the preview/backend boundary

The dashboard calls same-origin `/api/state` and `/api/file` endpoints. Their deployed runtime is **Netlify Functions**, not Lovable Cloud. The standard `npm run dev` preview uses browser-local drafts when those endpoints are unavailable; that is expected, not evidence of a shared backend failure. Netlify platform emulation is an explicit local option through `npm run dev:netlify`, not a requirement for a Lovable preview.

Do not place a GitHub token in browser code, a `VITE_` environment variable, chat prompts, or project knowledge to make a Lovable preview save remotely. Do not point an unauthenticated preview at live institutional data. A separately approved backend, access control, and CORS strategy would be required for shared saves outside Netlify.

Lovable editing compatibility does not imply that this Netlify-adapted project can be published unchanged to Lovable's own hosting runtime. Verify each chosen runtime separately.

## 5. Deploy the connected repository to Netlify

1. In Netlify, create or select the intended site and connect the **actual source repository/branch you will maintain**. Do not silently repoint an existing production site.
2. Use the repository root as the base directory. Keep build command `npm run build`, publish directory `dist/client`, functions directory `netlify/functions`, and Node version `24`.
3. Keep the official `@netlify/vite-plugin-tanstack-start` adapter in `vite.config.ts`. It creates the SSR handler; do not hand-edit generated `.netlify` files.
4. Keep the explicit API redirects in `netlify.toml`. Do not add a static SPA catch-all to `index.html`.
5. Leave `GITHUB_TOKEN` unset to use Netlify Blobs. If choosing the legacy GitHub data store instead, configure the function-scoped server-only variables listed in README, explicitly choosing the data repository and branch. Never commit the token.
6. Build a restricted deploy preview with synthetic data first. A static drag-and-drop upload of `dist/client` alone is insufficient because it omits SSR and API functions.

Netlify supports server rendering and server routes for TanStack Start through its official adapter. [Netlify setup guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/).

## 6. Acceptance checklist

- Clean installation, production build, TypeScript check, and persistence regression tests pass.
- The home page server-renders without `window` or `localStorage` errors, then hydrates without duplicate event handlers.
- Institutional and creator images load; all three original table tabs and eleven questions appear.
- Contributions, actions, and safe web source links can be added. Two rapid changes both survive reload.
- Text/Markdown/Word-compatible artifacts can be created and downloaded; uploads enforce the 5 MB limit.
- Day/night mode, PRIMER slide controls, keyboard presentation mode, Escape, and Print/PDF work. Kayla Almaguer's credit appears on screen and in print.
- On a Netlify preview, `/api/state` returns the expected provider and shared changes can be read from a second browser session. `/api/file` upload/download works. Do not count a local-only draft as a verified shared save.
- On small screens, navigation and forms remain usable and the page does not overflow horizontally.
- Lovable GitHub sync and preview have been checked independently; no claim of successful native import is made.

## 7. Security and release boundary

The inherited shared-content functions are unauthenticated. Identified submissions, arbitrary files, and a whole-state replacement operation make this a **prototype only**, not a ready institutional data-collection system. Netlify deployability does not supply Microsoft login, roles, database permissions, retention controls, or OTS approval.

Before a faculty/staff consultation with real data, implement the primary or backup plan's approved authentication and authorization, database, validation, rate limiting, audit trail, retention, and reporting controls. The current Netlify Blobs whole-state write model can lose cross-user concurrent updates; the browser queue fix is not a database transaction. Do not use a public GitHub repository to store confidential contributions.

Rollback: restore a reviewed prior Git commit or use the preserved `legacy/` source as a comparison baseline. Keep original data separately; moving UI code does not migrate or back up Netlify Blobs. Choose one intentional production owner/branch rather than operating two diverging production databases.
