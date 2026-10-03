# North Harris AI Task Force — Continuation Handoff

Updated: October 2, 2026

## Repository

- Local project: `C:\Users\victo\Desktop\North Harris AI Task Force`
- GitHub: `https://github.com/victogarcia4/proposal-for-ai-taskforce-nh`
- Branch: `main`
- Latest implementation commit before this handoff: `1260db4`
- Supabase project ref: `tpmvahgtmxtgshedtusy`

## What is implemented

- React/TanStack consultation dashboard with six working tables and 24 version-2 questions.
- Profile is the first page.
- Participants must provide a name and a verified `@lonestar.edu` or `@my.lonestar.edu` email.
- Passwordless Supabase six-digit email-code sign-in replaces Microsoft/Azure sign-in.
- The browser uses `supabase.auth.signInWithOtp()` followed by `verifyOtp({ type: "email" })`, so Outlook Safe Links do not need to open a one-time authentication URL.
- The Netlify API verifies the authenticated email, Lone Star domain, active invitation roster entry, membership, and profile requirements.
- Private drafts, proposals, revisions, discussion, committee review, reporting, attachments, and role checks remain in place.
- Footer credit uses the portrait at `public/VHGM traje azul.png` and displays `Dr. Victor Garcia Martinez`.
- Kayla Almaguer attribution appears only within the PRIMER framework/source surfaces.

## Important authentication configuration

In Supabase:

1. Enable **Authentication → Providers → Email**.
2. In **Authentication → URL Configuration**, set the production Site URL.
3. Add the local redirect URL `http://localhost:3001/**` and the production Netlify URL followed by `/**`.
4. Edit the Magic Link email template so it visibly includes the code variable `{{ .Token }}`, for example: `<p>Your sign-in code is: {{ .Token }}</p>`. The app verifies that six-digit code directly; users should not need to click the link.

No Azure client ID, client secret, tenant ID, or Azure redirect URI is required by the current application.

## Netlify configuration

Netlify should use:

- Build command: `npm run build`
- Publish directory: `dist/client`
- Functions directory: `netlify/functions`
- Node version: 24

Required server-side environment variables are documented in `.env.example`. At minimum, the deployed Netlify environment needs the Supabase URL, publishable key, and secret key. Never place the secret key in a browser-prefixed variable or commit it.

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
5. Confirm the email is present in the active consultation roster before expecting access to the consultation data.
6. Keep the consultation closed until institutional governance, roster, SMTP, accessibility, privacy, and live-data checks are complete.

## Recent commits

- `1260db4` Align API authorization with email link sign-in
- `5633d9c` Fix magic link session callback flow
- `9488a62` Use institutional email magic link sign-in
- `38b17a7` Add creator photo credit and scope PRIMER attribution
- `44e2e4d` Require Lone Star email and profile before participation

## Vercel support

Vercel support is configured but not deployed from this session. `vercel.json` selects the TanStack Start framework, `build:vercel` uses Nitro, and `api/` adapts the existing consultation and attachment handlers to Vercel Functions. The verified command is `npm run build:vercel`. Import the GitHub repository into Vercel and add the Supabase URL, publishable key, and server-only secret key as environment variables.
