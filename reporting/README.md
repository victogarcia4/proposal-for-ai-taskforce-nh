# Power BI handoff

The app includes reporting surfaces and a private `nh_analytics.metrics` snapshot table. `nh_refresh_reporting()` refreshes the six report-page datasets after confirmed writes. Only a server credential can refresh it. The `nh_bi_reader` role has read-only access to these aggregates and no access to profiles, emails, contributions, or pulse records.

The PostgreSQL connection endpoint, login account, Power BI workspace, and licensing are administered by OTS. No Power BI report has been published from this checkout.

In Power BI Desktop, create text parameters `SupabaseHost` and `SupabaseDatabase`, import `NorthHarrisConsultation.pq` using the PostgreSQL connector in Import mode, name the query `Metrics`, and add the measures in `Measures.dax`. Request a dedicated LOGIN account assigned `nh_bi_reader`; do not use the Supabase database owner for reporting.

Build six report pages filtered on `Metrics[page]`:

1. Participation: employment category, unit, discipline, round; adjunct faculty and staff remain separate. Use the verified roster denominator only at the correct grain.
2. Coverage: question counts, including non-applicable and insufficient-information contribution types.
3. Themes & risks: contribution types and the four coding dimensions; distinct contribution grain.
4. Positions: current-revision recorded positions; no inference from silence.
5. Dispositions & actions: outcomes, follow-up status, and norms with evidence.
6. Pulse: baseline/closing distributions; blank suppressed cells. National figures must be labeled with source, survey year, population, and the AAC&U non-scientific caveat.

Publish through authenticated Power BI access. Set daily refresh during open rounds and refresh after closure subject to tenant capacity. Do not enable Publish to web. Verify page totals against the SQL snapshot and the app before sharing. A refresh failure leaves the previous snapshot timestamp visible.
