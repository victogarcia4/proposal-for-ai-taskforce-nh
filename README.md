# North Harris AI Use Norms Consultation

English, human-led consultation implementing the version-2 plan: six working tables and 24 source-exact questions, quick/full proposals, reasoned discussion, private drafts and revisions, committee coding and synthesis, evidence-linked norms, draft comment rounds, and follow-up actions.

**Development pilot, not approved institutional policy.** A complete fictitious demo is available without sign-in. Supabase is installed, but live collection is disabled pending institutional authentication, server configuration, and governance approval. Do not collect confidential, student, clinical, or personnel data in the demo.

## Run and verify

Use Node.js 24:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`, choose **Explore the demo**, and switch between the four fictitious roles. Demo submissions last only for the browser session. A separately labeled private device draft can survive reload and is cleared at sign-out.

```sh
npm run check
```

Build, TypeScript and tests cover the question bank, validation, authorization, SQL transactions, revisions, retry idempotence, closed rounds, pulse suppression, attachments and local backup restoration. See [verification](VERIFICATION.md) for the limits of these checks.

## Supabase and Netlify

Project: `tpmvahgtmxtgshedtusy`. The browser uses only the supplied public publishable key. Every authenticated data request goes through a Netlify function; direct browser-role table access and write-function execution are denied. Attachments use a private 5 MB bucket.

Netlify builds with `npm run build`, publishes `dist/client`, uses Node 24, and includes the server-rendering adapter and API functions. Use Git-based deployment, not a static-only upload. `npm run dev:netlify` provides local platform emulation when configured.

Vercel is also supported. Import this GitHub repository into Vercel; the included `vercel.json` selects the TanStack Start framework and `npm run build:vercel` uses the Nitro Vercel adapter. The `api/` wrappers expose the consultation and attachment functions on Vercel. Add the same Supabase environment variables in Vercel Project Settings → Environment Variables, keeping the secret key server-only. After deployment, add the Vercel production URL and any preview URL pattern to Supabase Authentication → URL Configuration.

Configure [.env.example](.env.example) through the hosting environment. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser, plus `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SECRET_KEY` for Netlify Functions. **Never put `SUPABASE_SECRET_KEY` in a `VITE_` variable or commit it.** Participant sign-in uses a Supabase email code, so no Microsoft/Azure application setup is required and Outlook Safe Links do not need to open an authentication URL. Supabase Email must be enabled, its Magic Link template must include `{{ .Token }}`, and its Site URL/redirect allowlist must include the local and production app URLs. The app accepts Supabase's configurable 6–10 digit email OTP; the current project may use an 8-digit code. A verified institutional email is enrolled automatically; administrators can deactivate individual participants. A profile name is still required before participation, and the email is shown only to its owner.

Read [the activation checklist](IMPLEMENTATION.md) before enabling collection. Database source is in `database/`; ordered scripts are in `supabase/migrations/`. The first three scripts were applied through the signed-in SQL editor, not registered with CLI migration history. The fourth script adds the Lone Star email constraint and must be applied to the live project before activation. Reconcile the history before using CLI push; do not blindly reapply the earlier scripts.

## Analysis and reporting

Humans assign the four coding dimensions and write agreement, reservations, minority views and evidence gaps. Positions refer to specific proposal/norm revisions, not a vote. Participation distinguishes individual from collective contributions and uses only verified roster denominators. Pulse answers are stored separately from identity receipts and exposed only as suppressed aggregates.

[Power BI handoff](reporting/README.md) includes a private aggregate snapshot, Power Query, measures and six-page specifications. OTS-managed credentials, licensing, workspace publication and refresh verification remain prerequisites. No Power BI report is published.

## Preserved source

The original three-table/11-question session remains in `legacy/` and at `/archive` as a read-only historical reference. Its former `/api/state` and `/api/file` endpoints return HTTP 410. Original plans are retained; [version 2](AI_Policy_Application_Plan_v2.md) is authoritative for the new app. PRIMER remains attributed to Kayla Almaguer.

`npm run export:lovable` creates an ignored source handoff without credentials, participant data, Git history or build caches. It is a manual transfer package, not a native Lovable import.

