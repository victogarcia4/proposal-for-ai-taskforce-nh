# Verification record

## October 2, 2026 — version-2 consultation

- Production build, TypeScript and all 12 automated tests pass.
- Exact six-table/24-question source extraction, server validation, demo role gates and private drafts are tested.
- PostgreSQL tests exercise role denial, private grants/RLS, revisions, retry idempotence, conflict handling, closed rounds, reasoned positions, source-revision snapshots, draft guards, duplicate pulse receipts, aggregate suppression and read-only BI access.
- A local PostgreSQL backup is restored and revision/evidence records and access denial are checked again. This is not a live Supabase backup restore.
- Attachment tests check PDF/image/DOCX signatures, MIME/extension alignment, UTF-8 text and the 5 MB limit.
- The user's live Supabase project was read back after SQL-editor installation: six tables, 24 questions, RLS on all 29 tables, explicit deny policies, private bucket and browser-role function denial; collection disabled.
- Live checks with the supplied public key confirm protected profile/contribution/pulse/roster queries and write RPC are denied.
- The production-only dependency audit reports no known vulnerabilities; inherited development-tool findings remain documented separately.
- Browser demo verified a quick response and reasoned position, committee disposition, evidence-linked norm and publication, administrator comment-round opening, and participant norm feedback. Desktop rendering was inspected; a specific 390 px device viewport was not successfully established.
- Original four persistence tests remain for historical source regressions. The legacy public data functions are now retired (410).
- Current audit has inherited high-severity development-tool findings in the Netlify image-emulation dependency chain. The October 1 audit below is historical and is not the current security status.

Not verified: live institutional Microsoft login, server-secret hosting configuration, independent-account database saving/attachments, Netlify production deployment, institutional/OTS approval, full accessibility review, live disaster recovery, or published Power BI. See [activation checklist](IMPLEMENTATION.md).

## Historical repository preparation

Date: October 1, 2026  
Scope: Local Lovable-transfer preparation and Netlify build readiness; not an institutional production release.

## Verified locally

- Production browser and server builds complete; the official adapter generates `.netlify/v1/functions/server.mjs` for server rendering.
- TypeScript checks pass.
- Four automated persistence tests pass: serialized rapid edits, retry ordering, preservation of local notes/file bytes, and cleanup after unmount.
- Headless browser checks pass for server-rendered home content, hydration without runtime errors, loaded images, three table tabs, all eleven original questions, contributions, reload/draft retention, day/night theme, actions, web source links, Markdown creation/download, file upload, oversize rejection, PRIMER keyboard presentation, Escape, print attribution, and tablet/mobile horizontal layout.
- With a mocked shared API, both rapid submissions reach the server and remain after reload. This verifies the client queue, not live Netlify persistence or cross-user concurrency.
- Dependency installation/audit reports zero known vulnerabilities with the checked-in lockfile and `sharp` override. This is a point-in-time dependency check, not a security certification.
- Both English planning documents are retained in the repository; this portability work does not implement their six-table policy consultation.
- The source-transfer exporter creates a timestamped, ignored handoff folder with an explicit source allowlist and nested exclusions for environment secrets, Git metadata, data, and caches.

## Not yet verified or performed

- Native existing-repository import: Lovable does not offer it. Manual transfer into a newly Lovable-created GitHub repository is documented instead.
- Actual Lovable account/project sync, editor behavior, and preview build.
- GitHub commit/push of these local changes.
- Netlify site creation/deployment, account permissions, live `/api/state` and `/api/file` persistence, and second-session readback.
- Institutional authentication, authorization, OTS approval, database migration, human-analysis workflow, and Power BI.

## Next release gate

Use [the transfer/deployment guide](LOVABLE_IMPORT_GUIDE.md) to verify a restricted Netlify deploy preview with synthetic data and an independently linked Lovable project. The inherited unauthenticated content endpoints and whole-state Blobs writes remain prototype limitations. Resolve the planning documents' access control, concurrency, privacy, and governance requirements before collecting real institutional contributions.
