# North Harris AI Task Force — Continuation Handoff

## Privacy corrections, October 7, 2026

This section supersedes older claims about member-visible identities, attachments, persistent browser drafts, and report exports. See `PRIVACY_REVIEW_ES.md` for the evidence and unresolved production requirements. Changes are local until deployed.

- The owner subsequently requested removal of the institutional-review access switch and pre-code readiness check; both are removed. This does not certify compliance or grant institutional approval.
- Employee participants use verified `@lonestar.edu` addresses and a required employment-category/name/employee-attestation profile. `@my.lonestar.edu` student addresses are rejected by the server. Domain plus self-attestation is not HR verification.
- The sole administrator is the verified Auth identity `vhgarcia100@gmail.com`, with a separate email/password sign-in. Never put its password in source, documentation, logs or browser configuration. The owner reported creating the Auth account manually on October 7, 2026. Its confirmed email and live login have not been independently verified: connected Supabase cannot access the target project and local configuration has only public client credentials. Do NOT run account creation again unless the owner asks. See `ADMIN_ACCESS_ES.md`.
- Only that administrator receives complete contribution histories, previous discussion revisions and administrator/committee operations. The server rejects privileged writes by other identities even if old DB roles remain. Own latest contributions remain editable during open collection rounds.
- Names and optional demographics stay private to the account owner and administrators. Other member projections use a generic label. Administrative identity access must have an institutionally defined purpose.
- A versioned privacy acknowledgment is required by the API for profile, proposal, comment, position, and pulse writes. It records understanding of the notice, not legal FERPA consent to disclose records.
- Obvious identifiers are rejected in free text, and proposal fields are allowlisted. This cannot detect every name or identifiable case.
- File upload/download remains disabled. The sole admin can export contributions (including saved drafts), histories, discussion, norms, syntheses, actions and suppressed pulse aggregates through `/api/export?format=csv|pdf`. CSV is UTF-8 and escapes formula-leading cells. PDF uses a standard Latin-1 font; other characters are represented as U+hex. No named pulse records are exported. Browser screenshots/copying cannot be prohibited by these export permissions.
- Drafts and auth tokens use tab session storage. Existing local draft/auth entries migrate when accessed. Database drafts remain available across sign-ins. Browser session restore behavior can vary.
- Apply `database/privacy-reporting-hardening.sql` through an authorized database administrator before approving reporting. It replaces the reporting projection, removes granular demographics/free text labels and suppresses small and complementary cells. Previously downloaded BI snapshots require separate review.
- The connected Supabase account still does not list project `tpmvahgtmxtgshedtusy`. Production RLS, storage, contracts, historical content, and deployment were not verified in this review.

Updated: October 7, 2026. Build, typecheck and all 24 tests passed before the requested GitHub/Netlify publication. Supabase production checks remain separate.

## Repository

- Local project: `C:\Users\victo\Desktop\North Harris AI Task Force`
- GitHub: `https://github.com/victogarcia4/proposal-for-ai-taskforce-nh`
- Branch: `main`
- Latest implementation commit before this access/privacy update: `7827ca8`
- Supabase project ref: `tpmvahgtmxtgshedtusy`

## What is implemented

- React/TanStack consultation dashboard with six working tables and 24 version-2 questions.
- Profile is the first page.
- Current participants must provide a name and verified employee `@lonestar.edu` email; student participation is excluded. The sole Gmail administrator is a narrowly defined exception.
- Passwordless Supabase email-code sign-in replaces Microsoft/Azure sign-in; the app accepts the configurable 6–10 digit OTP range.
- The browser uses `supabase.auth.signInWithOtp()` followed by `verifyOtp({ type: "email" })`, so Outlook Safe Links do not need to open a one-time authentication URL.
- The Netlify API verifies the authenticated email and Lone Star domain, automatically enrolls new institutional accounts, preserves administrator deactivation, and enforces membership and profile requirements.
- Private drafts, proposals, revisions, discussion, committee review, reporting, attachments, and role checks remain in place.
- Footer credit uses the portrait at `public/VHGM traje azul.png` and displays `Dr. Victor Garcia Martinez`.
- Kayla Almaguer attribution appears only within the PRIMER framework/source surfaces.

## Important authentication configuration

In Supabase:

1. Enable **Authentication → Providers → Email**.
2. In **Authentication → URL Configuration**, set the production Site URL.
3. Add the local redirect URL `http://localhost:3001/**` and the production Netlify URL followed by `/**`.
4. Edit the Magic Link email template so it visibly includes the code variable `{{ .Token }}`, for example: `<p>Your sign-in code is: {{ .Token }}</p>`. The app verifies the code directly; users should not need to click the link. Supabase's Email OTP length may be set from 6 to 10 digits; the current project is sending 8 digits.

No Azure client ID, client secret, tenant ID, or Azure redirect URI is required by the current application.

## Netlify configuration

Netlify should use:

- Build command: `npm run build`
- Publish directory: `dist/client`
- Functions directory: `netlify/functions`
- Node version: 24

Required environment variables are documented in `.env.example`. The browser needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; Netlify Functions need `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SECRET_KEY`. Never place the secret key in a browser-prefixed variable or commit it. Netlify secret scanning omits only the public Supabase URL and publishable-key variable names; the secret key remains scanned.

## Local preview limitation

The ordinary Vite preview (`npm run dev`) serves the browser application but does not provide the `/api/consultation` Netlify function. When that server is used, the API can return the HTML app shell and produce a JSON parsing error. The client now reports this clearly.

For a complete local platform preview, use `npm run dev:netlify` after Netlify local emulation is configured. The deployed Netlify URL is the simplest way to test the complete authenticated flow.

## Verification

Run:

```text
npm run check
```

The verified suite includes production build, TypeScript checking, and 12 tests covering migrations, question content, validation, authorization, privacy suppression, retries, and database behavior.

## Recommended next steps

1. Confirm Supabase Email is enabled and redirect URLs are saved.
2. Confirm Netlify has the server-only Supabase environment variables.
3. Wait for the latest GitHub commit to deploy.
4. Test from the deployed Netlify URL with a real Lone Star email.
5. Confirm a new verified institutional account is automatically enrolled and receives the Participant role; confirm an administrator can deactivate it.
6. Keep the consultation closed until institutional governance, enrollment, SMTP, accessibility, privacy, and live-data checks are complete.

## Recent commits

- `1260db4` Align API authorization with email link sign-in
- `5633d9c` Fix magic link session callback flow
- `9488a62` Use institutional email magic link sign-in
- `38b17a7` Add creator photo credit and scope PRIMER attribution
- `44e2e4d` Require Lone Star email and profile before participation

## Vercel support

Vercel support is configured but not deployed from this session. `vercel.json` selects the TanStack Start framework, `build:vercel` uses Nitro, and `api/` adapts the existing consultation and attachment handlers to Vercel Functions. The verified command is `npm run build:vercel`. Import the GitHub repository into Vercel and add the Supabase URL, publishable key, and server-only secret key as environment variables.
