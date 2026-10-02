# Implementation and activation status

October 2, 2026. Authoritative scope: `AI_Policy_Application_Plan_v2.md`.

## Implemented

- Source-exact six-table/24-question bank, briefings and linked sources; original three-table/11-question read-only archive.
- Microsoft sign-in entry point, server-side verified-user/tenant/roster/membership gates, participant/facilitator/committee/administrator roles.
- Quick/full proposals, private device/server drafts, revision history, optimistic conflict checks, idempotent retries, reasoned positions and comments on specific revisions.
- Facilitated collective contributions, separate individual counts, committee human coding/catalog, linked evidence, dispositions, moderation preserving originals, practice approval, synthesis, and action board.
- Norm scope/strength/route, affected groups, checked rule URL/date, review date, reservations, supporting sources and frozen supporting-contribution revision snapshots.
- Versioned draft publication, norm comments, response summary and closed-round finalization gate.
- Optional six-item baseline/closing pulse, separate identity receipts, minimum-five and complementary suppression.
- Private 5 MB attachments with authorized downloads and extension/MIME/signature checks; daylight/night themes, print, PRIMER presentation and Kayla Almaguer attribution.
- SQL schema, seed, access hardening and analytics snapshots; Power BI handoff assets (not a published `.pbix`).

## Live project verified

The project was initially empty. The three checked-in migration scripts were applied through the user's signed-in Supabase SQL editor. Six tables and 24 questions are seeded, all 29 consultation tables have RLS, and direct browser-role writes are denied. Attachments are private. Live collection remains `enabled=false`; the initial listening round is closed. No real participant records or Auth users were created by this implementation.

Migration scripts are preserved in order. SQL-editor execution did not register Supabase CLI migration history; reconcile that history before using CLI push against this project. The local master-schema test and migration-chain test verify fresh-install behavior.

## Required before a live pilot

1. OTS/institutional owner supplies the exact Entra tenant and registers/configures the single-tenant Azure OAuth application in Supabase. Register authorized deployment/callback URLs and retain credentials in provider settings, not this repository.
2. Configure the server-only Supabase credential, publishable key, project URL, and `LSC_ENTRA_TENANT_ID` in Netlify. Store only the publishable key in browser-prefixed settings. The supplied public key cannot administer Auth or perform protected database writes.
3. Verify the institutional identity through a trusted provisioning process and set `app_metadata.institutional_tenant_id` administratively. This app intentionally does not trust self-editable metadata or suffix matching. Automated tenant provisioning has not been installed.
4. Bootstrap one approved administrator: create their verified Auth identity, roster entry, membership, profile and Administrator role using trusted administrative access. No administrator email or institutional roster was supplied, so none was invented.
5. Deploy a restricted preview; verify Microsoft login and logout, a second independent account, all role denial cases, live attachment upload/download, save/reload, conflict/retry, and reporting refresh. These authenticated live flows have not been verified.
6. Confirm consent/notice, retention and public-records rules, accessibility review, backup/restore responsibilities, source-policy verification, and institutional security/governance review. The local database restore test is not a live project disaster-recovery test.
7. Only after those checks, enable `nh_consultations.enabled` and use Administration to open the intended round. Keep real sensitive data out of the pilot.

## Reporting and limitations

`nh_analytics.metrics` contains aggregate snapshots and `nh_bi_reader` is NOLOGIN/read-only. OTS must provision a scoped login and approved Power BI workspace; neither a reporting account nor public exposure was created. Verify snapshot freshness and totals before interpreting a report.

The browser demo proves interaction paths, not institutional authorization or production deployment. A full mobile-device/screen-reader audit and live Power BI reconciliation remain pending.

Dependency audit currently identifies inherited high-severity development-tool findings in the Netlify image-emulation chain (`node-forge` via `listhen`/`ipx`). There was no compatible patched release available at the checked time. No forced breaking dependency replacement was performed; track the vendor fix and reassess before release. Successful build/tests do not certify security.
