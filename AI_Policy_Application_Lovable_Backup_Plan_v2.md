# Lovable Backup Plan for the LSC-North Harris AI Use Norms Consultation Application

Version: 2  
Date: October 2, 2026  
Status: Alternative development plan for review. Supersedes [version 1](AI_Policy_Application_Lovable_Backup_Plan.md), which is kept unchanged for reference. No Lovable project or external service has been created.  
Companion document: [Primary plan, version 2](AI_Policy_Application_Plan_v2.md). Section numbers below refer to it.  
Related: [Lovable transfer and Netlify guide](LOVABLE_IMPORT_GUIDE.md) and [Lovable project knowledge](LOVABLE_PROJECT_KNOWLEDGE.md).

## 1. Goal and relationship to the primary plan

The goal is the same as the primary plan's: an application that gathers contributions from LSC-North Harris faculty, adjuncts, and staff and turns them into a traceable draft of AI use norms for the campus.

This document describes a second way to build it, using Lovable as the development tool. It is a backup development route. It is not a failover system: it does not recover a Netlify, Supabase, or sign-in outage.

Rules that hold throughout:

- One production application and one production database at any time. The backup is built against a separate development project with fictitious data.
- The product specification, question bank, data contract, and reporting definitions are those of the primary plan. Where this document is silent, the primary plan governs.
- Lovable is used to write code. The application itself uses no generative AI to code, summarize, or draft contributions.

| Area | Primary route | Lovable backup route |
| --- | --- | --- |
| Development | Extend the existing React/TanStack Start repository by hand. | Generate and refine the consultation application in Lovable. |
| Source code | Existing repository. | A new GitHub repository created by Lovable's integration. |
| Hosting | Netlify. | Netlify, with the TanStack Start adapter. |
| Data and identity | Independently administered Supabase with LSC sign-in. | The same design, first in a separate development project. |
| Behavior | Primary plan sections 4 to 6. | The same behavior and a compatible data contract. |
| Reporting | PostgreSQL views imported into Power BI. | The same views and definitions. |
| Activation | Normal release. | Compatibility check, controlled cutover, rehearsed rollback. |

### What changed from version 1

- The outcome is norms for North Harris with a route for each norm, not a system policy draft.
- The specification adds quick responses, contribution types that include concerns and objections, the baseline pulse, briefing panels, dispositions, the "What we heard, what we did" page, the comment round, and the practice library.
- The question bank is at version 2 wording. Seven questions were revised.
- The build order follows the primary plan's three releases, so the Lovable route can stop after Release 1 and still meet the core goal.
- The build brief is rewritten to match.

## 2. Lovable capabilities and constraints

These findings come from official documentation checked on October 1, 2026 for version 1. They were not part of the NotebookLM source set and should be re-checked when a project is created.

- Lovable can connect to a Supabase project the organization owns. Its managed backend and an independently owned project are different choices, and switching later is not automatic. Choose the independent project at setup. [Supabase integration](https://docs.lovable.dev/integrations/supabase).
- Lovable's GitHub integration creates a new repository and syncs one branch. It does not import an existing repository. [GitHub integration](https://docs.lovable.dev/integrations/github).
- Lovable projects can be deployed to a separately chosen host, including Netlify. Backend configuration remains a separate task. [Deployment and ownership](https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership).
- New Lovable applications use TanStack Start. [Current framework](https://lovable.dev/blog/building-apps-using-tanstack-start). TanStack documents a Netlify adapter. [TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
- Lovable's Power BI connector reads existing semantic models. It does not load application records into Power BI, refresh models, or embed reports, so it is not the ingestion path here. [Power BI connector](https://docs.lovable.dev/integrations/power-bi).
- Lovable provides security scans and does not guarantee security. Human review and permission tests remain release criteria. [Security documentation](https://docs.lovable.dev/features/security).

Two starting points are possible, and the release owner chooses one:

1. **Fresh build.** Start a new Lovable project from the build brief in section 8 and treat the existing dashboard as a visual and content reference.
2. **Transfer, then extend.** Follow `LOVABLE_IMPORT_GUIDE.md` to move the existing React/TanStack shell into a Lovable-created repository using a `handoff/lovable-*` package, then build the consultation areas beside it. This keeps the PRIMER presentation, themes, and print output as they are, at the cost of carrying the legacy controller until it is retired.

### Constraint from LSC's own guidance

Lovable is an AI tool, and it is not in the tool comparison OTS publishes. LSC's guidance says not to enter confidential data into AI tools that OTS has not approved and to contact OTS before procuring AI tools. Therefore:

- Only fictitious records and approved public reference text go into Lovable prompts, project knowledge, and the development database.
- The Lovable integration is never connected to a production database.
- Use of Lovable for this project is included in the request to OTS described in the primary plan, section 7.

## 3. Evidence and principles

The backup uses the primary plan's evidence base (section 2) and design principles (section 3) without change. In brief: start from what LSC already requires; common baseline with local choice; treat skepticism as a contribution; support over policing; respect people's time; hear adjuncts and staff; close the loop; treat norms as living; humans analyze.

A visual rebuild of the current three-table, eleven-question dashboard would not meet this plan.

PRIMER is used as described in the project's [source document](https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit), with visible attribution to Kayla Almaguer on screen and in print.

## 4. Question bank, version 2

Seed the application with exactly these twenty-four questions. Identifiers are stable. Future wording changes create a new version and keep earlier answers attached to the wording they answered. Facilitator probes and briefing-panel content are in the primary plan, section 5.

### Table 1 Teaching, Learning, and Assessment

- T1Q1: Which learning outcomes must students demonstrate through their own thinking and performance, and where does AI accelerate, replace, or distort the skill being taught?
- T1Q2: Which AI uses should be prohibited, permitted, or required at each stage of an assignment?
- T1Q3: What evidence should demonstrate a student's learning process when AI is used?
- T1Q4: What discipline-specific activity would develop responsible AI skills for students' future work?

### Table 2 Academic Integrity, Transparency, and Intellectual Property

- T2Q1: What should students and employees disclose about their use of AI?
- T2Q2: What minimum elements should every North Harris syllabus AI statement contain, and what rule should apply when a syllabus or assignment is silent?
- T2Q3: What evidence and review steps should be required before a finding of AI-related academic misconduct, given that detection tools alone are not reliable evidence?
- T2Q4: What safeguards should apply when AI is used with copyrighted materials, research, or institutional publications?

### Table 3 Data Privacy, Security, and Tools

- T3Q1: Which institutional data may be entered into each category of AI tool?
- T3Q2: What information must a vendor provide before an AI tool is considered for institutional use?
- T3Q3: What process should employees follow to request, pilot, and review an AI tool, including AI features that appear inside software LSC already uses?
- T3Q4: What should happen when an AI tool exposes data or materially changes its features or terms?

### Table 4 Workplace Use, Student Services, and Human Accountability

- T4Q1: Which workplace or student-service tasks would benefit from an AI pilot?
- T4Q2: Which decisions must remain under a qualified employee's authority?
- T4Q3: How should people be informed when they interact with AI or receive an AI-assisted decision?
- T4Q4: What conditions, including workload, training time, and job security, would make an AI pilot acceptable to the employees whose work it affects?

### Table 5 Equity, Accessibility, and Professional Development

- T5Q1: What barriers prevent faculty, adjuncts, or staff from taking part in responsible AI use?
- T5Q2: What equivalent alternatives should be available when an AI tool is inaccessible, unaffordable, or declined?
- T5Q3: What AI competencies should employees demonstrate in their particular roles?
- T5Q4: What training formats, time, and recognition would make participation practical across schedules and employment categories?

### Table 6 Governance, Implementation, and Evaluation

- T6Q1: Which norms should apply across North Harris, and which decisions should remain with a discipline, a unit, or an individual instructor?
- T6Q2: Which norms can North Harris adopt itself, and which must be referred to OTS or the system policy process?
- T6Q3: What indicators and evidence should show whether a norm or pilot is working?
- T6Q4: How often should the norms be reviewed, and what process should handle exceptions, unresolved disagreements, and requests for change?

## 5. Product specification for Lovable

### Application areas

Orientation and sources; working tables; proposals and discussion; committee workspace; draft norms; "What we heard, what we did". A public entry page may describe the consultation and list public references. Everything else requires sign-in and membership.

A Lovable project collaborator is a developer. That status grants nothing inside the consultation application.

### Contribution behavior

- Two depths. A quick response has a contribution type, a statement of up to about 600 characters, and an optional scope. A full proposal has contribution type, issue, recommendation, rationale, example, people affected, risks, evidence, scope, suggested strength, and an optional attachment. A quick response can be expanded by its author.
- Contribution types: recommendation; concern or objection; practice to share; question for OTS or administration; information gap. "Not applicable to my role" and "I do not have enough information" are valid answers.
- Each table page shows two briefing panels, "What LSC already says" and "What others have found", with source links and the date checked.
- Drafts are private until submitted. Submitted proposals show name, employment category, and unit to members. A per-contribution "committee only" attribution flag exists in the data model and is disabled by configuration until the project owner decides.
- Collective proposals are labeled, tied to a session, and never counted as individual responses.
- Comments, and one reasoned position per member per proposal version: Support, Support with changes, Disagree. A new version requires reconfirmation and keeps history.
- Authors revise their own work with history. Nobody edits another person's contribution. Moderation records a reason and keeps the original.

### Baseline pulse

About six optional items at first sign-in and at close. Stored without a direct link to displayed identity, reported only in aggregate, and suppressed for groups below a configured threshold.

### Committee behavior

- Coding against a catalog with four dimensions: theme, risk, scope, suggested action. Multiple codes per contribution; coder recorded; original text untouched.
- Linking of similar proposals without merging or deleting.
- Synthesis per question: agreement, reservations, minority positions, missing evidence.
- One disposition per submitted proposal: incorporated; incorporated with changes; referred to OTS; referred to the system policy process; referred to professional development; deferred with reason; not adopted with reason. Authors see their dispositions.

### Norms behavior

- Each norm has a statement, scope (campus-wide baseline, division or department, course or unit discretion), strength (required, expected, recommended, not permitted), audiences, route (adopt at North Harris, refer to OTS, refer to system policy process, professional development request, already covered by existing LSC rule), linked existing LSC rule with date checked, linked contributions and sources, unresolved reservations, review date, and status.
- Drafts are versioned. A comment round collects comments and positions per norm. A response summary is published before the final draft.
- Approved "practice to share" contributions appear in a practice library.

### Roles and presentation

Participant, facilitator, committee analyst or editor, administrator. Employment category, discipline, and unit grant no privileges. The interface works on phones, by keyboard, and with screen readers. Preserve day and night themes, the PRIMER presentation, and print/PDF output.

### Data contract and backend boundaries

Use the entities in the primary plan, section 7: consultations, rounds, sessions, profiles, memberships, roles, roster; tables, questions and versions, briefing panels, sources; contributions and revisions, collective context, comments, positions, pulse responses, attachments; codes and assignments, syntheses, dispositions, link groups; drafts and versions, norms, norm links, norm comments and positions, round responses; actions and audit events.

- Identifiers, timestamps, field meanings, and analytics definitions match the primary application so records can move between the two without loss. Timestamps in UTC, displayed in America/Chicago.
- Supabase Auth with the Microsoft provider restricted to the LSC tenant, plus a maintained membership roster. Test sign-in and sign-out in preview and on Netlify. [Microsoft authentication](https://supabase.com/docs/guides/auth/social-login/auth-azure).
- User-scoped access with explicit grants and row-level security for ordinary participation. Privileged operations in reviewed server functions that check session, membership, role, round, and input. A hidden button or an editable profile field is never the control. Privileged keys stay on the server. [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
- Attachments in private storage, 5 MB limit, PDF, DOCX, TXT, MD, PNG, JPEG, with a required description and controlled download. No records or uploads in GitHub.
- "Saved" only after the database confirms. Idempotent requests. Version checks that refuse to overwrite a newer version silently. Local drafts scoped to the signed-in user and cleared at sign-out.

## 6. Development sequence

The steps map to the primary plan's releases so both routes can be compared at the same checkpoints.

### Step 1 Ownership and setup (Release 0)

Create the Lovable project in the approved workspace. Choose the starting point from section 2. Configure the independent Supabase development project first. Connect GitHub so Lovable creates its repository; leave the original repository intact. Load this plan, the primary plan, and the seed content as project knowledge. Nothing in this step is performed by saving this document.

### Step 2 Interface on fictitious data (Release 1)

Generate the orientation area, the six tables with briefing panels, quick-response and full-proposal forms, proposal views, comments, positions, and the pulse. Include participant, facilitator, and administrator views. Label simulated identities clearly. Walk one complete participant journey on a phone before connecting real persistence.

### Step 3 Database and access controls (Release 1)

Have Lovable propose the schema, policies, and generated types in the development project. A person reviews each migration and grant before it runs. Confirm that anonymous users see no consultation data, that members read submitted content and only their own drafts, and that pulse responses cannot be joined to names. Make multi-row operations atomic. Test through the API directly, not only through the interface.

### Step 4 Committee workspace (Release 2)

Add coding, proposal linking, synthesis, dispositions, author notification, and the "What we heard, what we did" page.

### Step 5 Reporting (Release 2)

Create the analytics views and a read-only BI account. Build the Power BI model and reports outside Lovable, from the same view definitions as the primary plan. Reconcile every measure against the database.

### Step 6 Norms and comment round (Release 3)

Add norm records, links to contributions and sources, versioned drafts, the comment round, the response summary, the practice library, the closing pulse, and print/PDF of the draft with its evidence.

### Step 7 Netlify preview

Inspect the generated package manifest and deployment configuration. Use the current Netlify TanStack Start adapter; do not assume a static deployment. Remove host-specific dependencies that block Netlify. Set callback URLs and secrets per environment in managed configuration. Build from a reviewed branch of the synced repository.

### Step 8 Validation and readiness

Run Lovable's security scans and review the findings. Independently test authorization, persistence, concurrency, exports, accessibility, and deployed routes. Obtain the OTS confirmations listed in the primary plan before any real pilot.

### Step 9 Pilot and activation candidate

Run the same role-diverse pilot as the primary plan, with adjuncts and staff included. Record the tested commit, schema version, deployment configuration, report version, restore procedure, and known issues. The backup becomes an activation candidate only when the checks in section 9 pass.

## 7. Power BI data flow

Contribution, PostgreSQL record, human coding, curated view, Power BI Import model, authenticated report.

Use the PostgreSQL connector with a read-only account, encrypted connection, and tested refresh. [PostgreSQL connector](https://learn.microsoft.com/en-us/power-query/connectors/postgresql). Use the session pooler where the path is IPv4-only. [Database connectivity](https://supabase.com/docs/guides/database/connecting-to-postgres).

Deliver the six report pages and follow the measurement rules in the primary plan, section 9: participation with adjuncts and staff shown separately; coverage; themes with concerns beside recommendations; positions; dispositions and traceability; pulse results beside labeled national figures. Unique counts at the right grain, labeled denominators, support calculated only among recorded positions, small groups suppressed.

The Lovable Power BI connector is not used in version 1. Link to authenticated reports. Confirm licenses with OTS. Do not use Publish to web. [Sharing](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards), [Publish to web](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web).

## 8. Initial Lovable build brief

Use after the workspace and the development database are configured. Attach the question bank from section 4 and both version 2 plans as project knowledge.

> Build an English-language consultation application called North Harris AI Use Norms Working Tables for Lone Star College-North Harris faculty, adjunct faculty, and staff. Its purpose is to gather contributions and turn them into a traceable draft of AI use norms for the campus. Use React, TypeScript, and the current TanStack Start stack, prepared for Netlify. Connect only to the independently owned Supabase development project configured for this work and use fictitious records. Implement six working tables with the exact twenty-four questions in the project knowledge, each table page opening with two briefing panels, "What LSC already says" and "What others have found", with source links and a date checked. Members contribute at two depths: a quick response that takes under five minutes on a phone, and a full structured proposal. Contribution types are recommendation, concern or objection, practice to share, question for OTS or administration, and information gap; never assume the participant uses or wants AI. Private drafts belong to their authors; submitted proposals show verified name, employment category, and unit to members. Implement revisions with history, comments, collective proposals tied to a session, and one reasoned position per member per proposal version: Support, Support with changes, Disagree. Add an optional six-item baseline pulse stored apart from displayed identity and reported only in aggregate. For the committee, implement human coding, synthesis, and a disposition for every proposal that its author can see, plus a "What we heard, what we did" page. Implement versioned draft norms whose records carry scope, strength, audiences, route, linked existing LSC rule, linked contributions and sources, reservations, and review date, with a comment round per norm. Enforce access in the database and server functions, not only in the interface. Preserve Kayla Almaguer's attribution for PRIMER, the PRIMER presentation, day and night themes, accessible mobile navigation, and print/PDF output. Do not add automated AI analysis or drafting. Prepare read-only analytics views for Power BI. Build in this order: collection first, then committee workspace, then norms. Explain proposed schema changes before applying them. Keep real institutional data and privileged credentials out of prompts, browser code, and GitHub.

## 9. Acceptance criteria and delivery package

The backup is complete when there is evidence that:

- All six tables and exactly twenty-four questions match the version 2 wording.
- A member can submit a quick response on a phone in under five minutes, expand it later, contribute across tables, and resume private drafts.
- A concern or objection can be submitted without proposing any AI use and appears in reports beside recommendations.
- Unauthorized users cannot reach consultation data, files, or reports.
- No member can change another's contribution or raise their own role, including through direct API requests.
- Pulse answers cannot be tied to a name through the interface, exports, or the reporting model.
- Collective proposals stay distinguishable from individual responses.
- Concurrent and repeated requests neither lose nor duplicate records.
- Position history stays tied to proposal versions, with reconfirmation after changes.
- Every submitted proposal can receive a disposition that its author sees.
- Every norm shows scope, strength, route, linked LSC rule, sources, reservations, and review date; the comment round works per norm.
- Schema and data exchange tests show compatibility with the primary application.
- Power BI measures reconcile with the database and use labeled denominators.
- Netlify deep links, server functions, sign-in callbacks, sign-out, and protected downloads work in the deployed preview.
- Keyboard, screen-reader, mobile, theme, presentation, and print workflows are verified.
- Security findings are reviewed, and unresolved blocking issues are recorded.
- Backup restoration and the cutover and rollback procedure have been rehearsed.

Deliver: the GitHub repository, reviewed migrations and seed content, environment configuration guide, permission matrix, deployment guide, Power BI model and report definitions, test evidence, and cutover and rollback instructions. No secret values in any handoff document.

## 10. Compatibility, cutover, and rollback

Keep the Lovable development project away from production. The development integration can change backend configuration, so sharing a database between development applications is not safe.

Cutover:

1. Record why the alternative is being activated and name the release owner.
2. Record the application commit, schema version, analytics views, and report version. Verify in a test environment that the backup reads and writes the production contract.
3. Snapshot database and files. Close submissions and confirm pending saves have completed.
4. If the primary route already runs on the agreed production backend, point the independently deployed backup at it, reusing identity and identifiers without copying data and without exposing production to the Lovable integration.
5. If the only data is in the original dashboard's stores, import snapshots into an archive consultation with the original eleven questions, timestamps, declared authors marked unverified, and legacy identifiers.
6. Test sign-in, membership, drafts, proposals, files, positions, history, dispositions, and norm links. Reconcile totals and Power BI output.
7. Route the entry point to the validated release and reopen submissions. Keep the previous application read-only through the rollback window.
8. Monitor failed saves, access errors, and report refresh. Record the outcome.

Rollback uses the previous validated application against a compatible database contract. If data was migrated, preserve and reconcile writes made after cutover; do not restore a snapshot that discards them. Rehearse rollback before activation.

## 11. External prerequisites and costs

Before real participation, name an owner for Lovable, GitHub, Netlify, Supabase, the identity registration, Power BI, and ongoing support. OTS and the institutional reviewers confirm vendor suitability including Lovable, hosting region, access, data classification, retention, backup, public-records handling, and the adoption route for campus norms.

Budget Lovable development usage separately from hosting, database, storage, backups, and Power BI. Check current subscription and capacity terms at provisioning. Do not assume a free tier meets production or institutional requirements.

Scope matches the primary plan: North Harris employees first; students and dual-credit partners are affected groups until a later phase; synthesis stays human; adoption follows LSC authority and not application positions.

Saving this plan creates no Lovable project, subscription, or deployment and changes no code.
