# Power BI handoff

## Privacy review, October 7, 2026

Before using an existing installation, have an authorized database administrator apply `database/privacy-reporting-hardening.sql`. Existing versioned migrations are unchanged. New setup uses the revised `database/reporting.sql`.

The revised projection exports broad employment categories, fixed contribution types, question coverage, current positions, dispositions, and pulse distributions. It omits units, disciplines, names, identity keys, free text, code labels, and enrollment denominators. Small cells require at least five distinct contributing authors for contribution metrics, and the whole distribution is suppressed if any cell is small. Pulse uses respondent counts. These controls reduce identification risk but do not establish legal de-identification. Institutional reviewers must consider combinations, repeated releases, and existing BI copies before sharing.

The earlier page instructions below describe the former reporting scope and must not reintroduce removed dimensions or text. Keep access authenticated and do not publish reports to the web.

The app includes reporting surfaces and a private `nh_analytics.metrics` snapshot table. `nh_refresh_reporting()` refreshes the six report-page datasets after confirmed writes. Only a server credential can refresh it. The `nh_bi_reader` role has read-only access to these aggregates and no access to profiles, emails, contributions, or pulse records.

The PostgreSQL connection endpoint, login account, Power BI workspace, and licensing are administered by OTS. No Power BI report has been published from this checkout.

In Power BI Desktop, create text parameters `SupabaseHost` and `SupabaseDatabase`, import `NorthHarrisConsultation.pq` using the PostgreSQL connector in Import mode, name the query `Metrics`, and add the measures in `Measures.dax`. Request a dedicated LOGIN account assigned `nh_bi_reader`; do not use the Supabase database owner for reporting.

Build six report pages filtered on `Metrics[page]`:

1. Participation: broad employment category and round. Do not add unit, discipline, or enrollment denominators.
2. Coverage: question counts, including non-applicable and insufficient-information contribution types.
3. Themes & risks: fixed contribution types only. Keep code labels and detailed coding within the restricted consultation review.
4. Positions: current-revision recorded positions; no inference from silence.
5. Dispositions & actions: suppressed disposition counts. Detailed follow-up and evidence remain in the consultation.
6. Pulse: baseline/closing distributions; blank suppressed cells. National figures must be labeled with source, survey year, population, and the AAC&U non-scientific caveat.

Publish through authenticated Power BI access. Set daily refresh during open rounds and refresh after closure subject to tenant capacity. Do not enable Publish to web. Verify page totals against the SQL snapshot and the app before sharing. A refresh failure leaves the previous snapshot timestamp visible.
