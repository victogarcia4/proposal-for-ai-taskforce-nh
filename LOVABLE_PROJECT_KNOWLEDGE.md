# North Harris AI Task Force — Project Knowledge

This file is a brief for the Lovable editor. It does not configure or authorize any cloud service.

## Current scope

Prepare and maintain the existing English working-session dashboard. It contains three tables (Curriculum, Workplace, Follow-up), eleven prompts, nine PRIMER presentation slides, actions, artifacts, day/night modes, and print support. PRIMER is attributed to Kayla Almaguer; retain the on-screen and printed credit. Preserve Dr. Victor Garcia Martinez's existing creator credit and source document link.

The primary and backup planning files define a future six-table, twenty-four-question policy consultation for faculty, adjuncts, and all levels of staff. They are plans for review, not an instruction to implement every planned feature now.

## Technical boundaries

- React + TypeScript + TanStack Start, Vite, official Netlify adapter, Node.js 24.
- `Dashboard.tsx` owns the static shell. `dashboard-controller.mjs` mounts after hydration and owns the empty dynamic containers/forms. Cleanup cancels listeners and requests. Do not add competing React handlers or rerender controller-owned containers until intentionally refactoring this boundary.
- Keep `north-harris-ai-task-force-dashboard-v1` and `north-harris-theme` browser-storage keys for existing drafts.
- Preserve serialized append-only saves in `persistence.mjs`; do not restore debounced writes that drop rapid edits.
- Public assets are addressed from `/`, not `/public/`.
- Netlify publishes `dist/client` and generates an SSR handler. Keep custom functions and explicit API redirects; no SPA-to-index redirect.
- `/api/state` and `/api/file` are Netlify functions. Lovable preview can use browser-local storage when those functions are unavailable. Do not claim local drafts are remotely submitted.
- `.env.example` contains placeholders. GitHub tokens belong only in server-side Netlify environment settings, never browser variables or this knowledge file.
- Original standalone source is preserved in `legacy/`. Do not remove it without an explicit archival decision.
- The transitive `sharp` dependency is overridden to version `0.35.5` to address image-library advisories in Netlify development tooling. Recheck the audit and compatibility before changing this pin.

## Release limitations

This is an unauthenticated prototype. It does not yet include approved Microsoft/LSC login, participant roles, transaction-safe relational storage, moderation, qualitative analysis, policy-version traceability, or Power BI. Do not collect confidential student/personnel/institutional data or imply official policy approval.

Do not create paid services, new cloud projects, credentials, or a production deployment merely because a plan mentions them. The user must select the implementation phase and approve infrastructure/governance choices. Use synthetic data for preview testing.

## Verification

Run `npm ci` and `npm run check` after changes. Check hydration, rapid saves, existing draft retention, all tables, PRIMER/print attribution, actions, file creation/upload/download, source links, themes, and desktop/mobile layout. Separately verify Lovable sync/preview and Netlify shared persistence on the chosen deployed preview before a release.
