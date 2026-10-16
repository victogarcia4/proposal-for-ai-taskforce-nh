# North Harris Faculty AI Consultation

Simplified, faculty-only version of the consultation. It lives in this folder and does not change the original app at the repository root.

## What faculty do (about 15 minutes)

1. Sign in with a `@lonestar.edu` code. Student addresses (`@my.lonestar.edu`) are rejected.
2. Profile: category (full-time or adjunct), division, years teaching. No name is collected.
3. **Part A: General AI use** (11 items, ~4 min): frequency, tools, preferred tool per use case, proficiency, knowledge of LSC guidelines and Texas requirements (TX-RAMP, Texas Responsible AI Governance Act), training, syllabus statement, perceived benefit by area, overall sentiment.
4. **Part B: 10 core questions** (~1 min each), one per screen: prefilled options plus **Other** (text up to 600 characters) and one opinion type (Advice, Question, Concern, Claim, Practice to share, Information gap, Not sure).
5. Optional: 4 more questions.

The administrator (`nhf_admins`) sees counts per option, opinion types, written answers and a CSV export with anonymous participant numbers.

Content is defined in `src/content.mjs`. Option ids are stored in the database, so do not reuse an id for a new meaning.

## Supabase

Uses the same project as the original app (`tpmvahgtmxtgshedtusy`) with new `nhf_*` tables only. The migration is additive and does not touch `nh_*` tables.

```text
supabase/migrations/20261016120000_faculty_app.sql
```

Apply it with the Supabase SQL editor or `supabase db push` from this folder. The email-code templates already configured for the original app are reused.

## Run and deploy

```text
npm install
npm run check     # typecheck, tests, build
npm run dev       # without .env it runs in demo mode with fictitious data
```

Netlify: create a **new site** from this repository with base directory `faculty-app` (build `npm run build`, publish `dist`). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. No server secret is required; access is enforced by row-level security. Add the new site URL to Supabase **Authentication → URL Configuration**.
