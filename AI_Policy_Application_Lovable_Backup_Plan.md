# Lovable Backup Plan for the Lone Star College AI Policy Application

Date: October 1, 2026  
Status: Final English alternative development plan for review; no Lovable project or external service has been created. The existing prototype's transfer preparation is documented in [the platform guide](LOVABLE_IMPORT_GUIDE.md).  
Purpose: Provide an alternative implementation route using Lovable while preserving the consultation goals, governance, data structure, and Power BI reporting.  
Companion document: [Primary application plan](AI_Policy_Application_Plan.md).

## Purpose and relationship to the primary plan

Use Lovable to develop an alternative application for North Harris faculty, adjuncts, and staff to propose an AI use policy for Lone Star College. The alternative must support the same six working tables, twenty-four questions, named participation, reasoned positions, human analysis, and traceable policy draft described in the primary plan.

This is a backup development route, not an automatic failover system. It can replace the primary interface after validation and an intentional cutover. Both approaches retain Netlify as the hosting target and an independently administered PostgreSQL backend, subject to OTS review.

Do not operate two competing write paths against live consultation data while the backup is being developed. Build the alternative against a separate Supabase development project with fictitious data. At activation, choose one production application and one authoritative production database.

| Area | Primary route | Lovable backup route |
| --- | --- | --- |
| Development | Extend the existing project, originally vanilla and now prepared with a React/TanStack compatibility shell. | Generate and refine a separate React and TypeScript policy application using Lovable. |
| Source code | Existing repository. | A separate GitHub repository created through Lovable's integration. |
| Hosting | Netlify frontend and functions. | Netlify with the adapter required by the generated framework. |
| Data and identity | Independently administered Supabase and institutional sign-in. | The same target backend design, initially in a separate development project. |
| Policy workflow | Six tables, proposals, discussion, synthesis, and draft. | Equivalent behavior and compatible data contracts. |
| Reporting | PostgreSQL analytics views imported into Power BI. | The same reporting definitions and ingestion direction. |
| Activation | Normal release process. | Compatibility verification, a controlled cutover, and a rollback rehearsal. |

Lovable is a development tool in this plan. The application does not use generative AI to analyze participants' proposals or write committee conclusions in version one.

## Verified Lovable capabilities and constraints

The following findings are based on official documentation checked on October 1, 2026. The implementation choices that follow are recommendations for this project.

- Lovable can connect to a Supabase project owned by the organization. Its managed Cloud backend and an independently owned Supabase project are distinct choices; switching between them is not automatic. Choose the independent project at setup. [Supabase integration](https://docs.lovable.dev/integrations/supabase).
- Lovable's GitHub integration creates a new repository and synchronizes an active branch. It does not offer importing this existing GitHub repository through its standard integration. Start a separate project and use the existing application as a requirements and visual reference. [GitHub integration](https://docs.lovable.dev/integrations/github).
- Lovable supports development with deployment to a separately selected host, including Netlify. Backend deployment and configuration still need separate attention. [Deployment and ownership](https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership).
- Lovable documents TanStack Start for new applications. Do not assume that every generated project is an older static React and Vite app. [Current framework](https://lovable.dev/blog/building-apps-using-tanstack-start).
- TanStack documents a Netlify adapter for TanStack Start. Use that deployment route for a newly generated application and validate authentication callbacks and deep links in the deployed environment. [TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
- Lovable's Power BI connector reads existing semantic models. It does not push application records into Power BI, refresh models, or embed reports. It is not the ingestion mechanism for this project. [Power BI connector](https://docs.lovable.dev/integrations/power-bi).
- Lovable provides Quick and Deep security scans but does not guarantee application security. Include human review and permission tests as release criteria. [Security documentation](https://docs.lovable.dev/features/security).

These constraints rule out a simple import-and-publish conversion of the current repository. The backup is a separately built implementation of the agreed product specification.

## Policy research and PRIMER foundations

The backup uses the same institutional evidence as the primary plan. The sources describe different instruments, including guidance, regulations, approved policies, and drafts. Do not present external institutional practices as automatically adopted by LSC.

| Reference | Application requirement informed by the comparison |
| --- | --- |
| [LSC OTS guidelines](https://www.lonestar.edu/OTS-AI-Guidelines) and [data levels and tools](https://www.lonestar.edu/OTS-AI-Tools) | Begin with existing LSC guidance and maintain clear provenance for tool permissions and data classification. |
| [Austin Community College](https://offices.austincc.edu/institutional-effectiveness-and-grant-development/master-syllabi/artificial-intelligence-draft-policies/) | Ask about syllabus expectations, permissible use, disclosure, and review of suspected misconduct. |
| [Maricopa Community Colleges](https://district.maricopa.edu/administrative-regulations/2-students/2-3) | Relate proposed AI integrity expectations to established review and appeal procedures. |
| [Minnesota State](https://www.minnstate.edu/system/asa/innovations/docs/minnesota-state-generative-ai-guidance.pdf) | Include equity, intellectual property, and intersections with existing policies. |
| [South Georgia State College](https://www.sgsc.edu/content/userfiles/files/SGSC%20AI%20Policy.pdf) | Discuss tool inventory, accountable owners, vendor review, and recurring evaluation. |
| [UT Austin](https://security.utexas.edu/ai-tools) and [Harvard](https://www.huit.harvard.edu/ai/guidelines) | Structure discussion of data handling, permitted tools, and human accountability. |
| [University of Michigan](https://genai.umich.edu/committee-reports) | Support participatory consultation and institutional review. |
| [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook) | Organize governance and evaluation; identify the framework as voluntary. |

Use PRIMER as described in [the project's source document](https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit), with visible attribution to Kayla Almaguer. Its six qualities are Process-Oriented, Reflective, Interactive, Multi-Modal, Engaging, and Relevant.

Implement these qualities through proposal history, reflection, comments, accessible supporting materials, visible consideration of contributions, and links to actual work or learning cases. Preserve the eight-stage cycle: preparation, research, collaboration, case work, presentation, feedback, pilot application, and reflection.

The current dashboard has three tables and eleven questions. Rebuilding it visually without adding the missing policy topics would not meet this plan. The alternative must cover disclosure, authorship, copyright, consequential decisions, bias, appeals, providers, retention, incidents, authority, and traceability.

## Working tables and question bank

Use these exact twenty-four questions as the initial seed content. Assign stable identifiers and record wording versions. The labels T1Q1 through T6Q4 below are the initial content identifiers; future wording changes must preserve the old version and its responses.

### Table 1 Teaching Learning and Assessment

Deliverable: AI use criteria and PRIMER assignment examples.

1. T1Q1: Which learning outcomes must students demonstrate through their own thinking and performance?
2. T1Q2: Which AI uses should be prohibited, permitted, or required at each stage of an assignment?
3. T1Q3: What evidence should demonstrate a student's learning process when AI is used?
4. T1Q4: What discipline-specific activity would develop responsible AI skills for students' future work?

### Table 2 Academic Integrity Transparency and Intellectual Property

Deliverable: Shared disclosure, integrity, authorship, and case-review expectations.

1. T2Q1: What should students and employees disclose about their use of AI?
2. T2Q2: What common AI expectations should appear in every syllabus and assignment?
3. T2Q3: What evidence and review process should be required before finding AI-related academic misconduct?
4. T2Q4: What safeguards should apply when AI is used with copyrighted materials, research, or institutional publications?

Discussion support must include detector limitations, additional evidence, student response, and appeals.

### Table 3 Data Privacy Security and Tool Procurement

Deliverable: Proposed data and use matrix, vendor requirements, and review process.

1. T3Q1: Which institutional data may be entered into each category of approved AI tool?
2. T3Q2: What information must a vendor provide before an AI tool is considered for institutional use?
3. T3Q3: What process should employees follow to request, pilot, and review an AI tool?
4. T3Q4: What should happen when an AI tool exposes data or materially changes its features or terms?

Use cases must include student, employee, financial, and relevant clinical data, plus AI features embedded in existing tools.

### Table 4 Workplace Use Student Services and Human Accountability

Deliverable: Prioritized pilots and boundaries for human oversight.

1. T4Q1: Which workplace or student-service tasks would benefit from an AI pilot?
2. T4Q2: Which decisions must remain under a qualified employee's authority?
3. T4Q3: How should people be informed when they interact with AI or receive an AI-assisted decision?
4. T4Q4: What conditions would make an AI pilot acceptable to the employees whose work it affects?

Represent academic work, advising, admissions, HR, finance, libraries, communications, IT, and campus operations. Discuss service quality, bias, human assistance, workload, and decision review.

### Table 5 Equity Accessibility and Professional Development

Deliverable: Access and role-based training plan, including adjuncts.

1. T5Q1: What barriers prevent faculty, adjuncts, or staff from participating in responsible AI use?
2. T5Q2: What equivalent alternatives should be available when an AI tool is inaccessible or unavailable?
3. T5Q3: What AI competencies should employees demonstrate in their particular roles?
4. T5Q4: What training arrangements would make participation practical across schedules and employment categories?

Include costs, devices, disability, language, experience, schedules, and available time.

### Table 6 Governance Implementation and Evaluation

Deliverable: Responsibilities, institutional review route, and indicators.

1. T6Q1: Which principles should apply across LSC, and which decisions should remain discipline- or unit-specific?
2. T6Q2: Who should review, authorize, implement, and periodically update AI rules and procedures?
3. T6Q3: What indicators and evidence should determine whether an AI policy or pilot is working?
4. T6Q4: What process should address exceptions, unresolved disagreements, and requests to revise the policy?

Distinguish committee recommendations from institutional authorization. LSC's existing adoption rules remain external to application voting. [LSC Policy Manual](https://www.lonestar.edu/policy.htm).

## Product specification for Lovable

### Application areas

Build orientation and sources, working tables, proposals and discussion, committee synthesis, policy draft, and indicators. The design must work on mobile devices, provide keyboard navigation, and support screen readers. Preserve day/night themes, a PRIMER presentation, and print/PDF output.

The public entry page may describe the consultation and show approved public references. Proposal data, contributor names, attachments, and drafts require authenticated and authorized access. A Lovable project collaborator is a developer; that status must not grant membership or administrative privileges in the consultation application.

### Contribution and review behavior

- Participants can contribute to all six tables through meeting or asynchronous workflows.
- The contribution form captures issue, recommendation, rationale, example, affected people, risks, and available evidence.
- Allow insufficient information and not applicable to my role as explicit responses.
- Drafts remain private until submitted; submitted names, employment category, and unit are visible to authorized members.
- Record individual or collective authorship without turning attendance into individual answers.
- Enable comments and reasoned positions: Support, Support with changes, and Disagree.
- Store one position per user and proposal version. Preserve historical positions and require reconfirmation after a new proposal version.
- Allow authors to revise their own contributions with history; prevent changes to others' work.
- Facilitators can record meeting context and collective outputs. Analysts can tag and synthesize without overwriting source contributions.
- Record moderation decisions and preserve originals under controlled access.
- Link draft clauses to source proposals, reference documents, reviewer, status, and unresolved reservations.

Participant, facilitator, committee analyst or editor, and administrator are application roles. Employment category, discipline, unit, and organizational level do not grant privileges.

### Data contract and backend boundaries

Use the same conceptual entities as the primary plan: consultations, rounds, profiles, memberships, tables, questions and versions, sources, proposals and revisions, comments, positions, coding tags, syntheses, drafts and clauses, provenance links, actions, files, and audit events.

Keep identifiers, timestamps, field meaning, and analytics definitions compatible with the primary application. Store timestamps in UTC and show dates in America/Chicago. The primary and backup implementations must exchange records without losing question versions, authorship context, or draft provenance.

Use Supabase Auth with the Microsoft provider, restricted to the LSC tenant and a separately maintained membership list. Test sign-in and sign-out in both preview and Netlify environments. [Microsoft authentication](https://supabase.com/docs/guides/auth/social-login/auth-azure).

Choose an independently owned Supabase project before adding database features. Keep development and production separate. Do not connect the Lovable development integration to a live production database where an agent could apply schema changes or inspect participant records.

Use user-scoped Supabase access with explicit grants and row-level security for ordinary participation. Put privileged operations in reviewed Supabase Edge Functions. Validate session, membership, operation permission, and input on the server; do not trust a hidden button or user-editable profile role. Keep privileged keys server-side. [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).

Store attachments privately with the same 5 MB limit and accepted PDF, DOCX, TXT, MD, PNG, and JPEG types as the primary plan. Require accessible descriptions and controlled downloads. Keep records and uploaded files out of GitHub.

Confirm durable saves before showing Saved. Use idempotent requests and optimistic version checks. Scope local drafts to the signed-in user and clear them at sign-out. Refuse to overwrite a newer proposal version silently.

## Development sequence in Lovable

### Step 1 Establish requirements and ownership

Create a new Lovable project under the approved development workspace. Provide this plan and the primary plan as project knowledge. Supply only approved reference content and fictitious examples. Treat any institutional source not yet cleared for the development tool as an external review item.

Configure the independent Supabase development project at the beginning. Connect GitHub so Lovable creates a separate repository. Keep the original repository intact. These are future implementation steps, not actions performed by saving this plan.

### Step 2 Build the interface with fictitious data

Generate the six application areas, the exact question bank, contribution forms, proposal views, comments, positions, and the PRIMER presentation. Include participant, facilitator, and analyst views. Label simulated identities and data clearly.

Review a complete user journey before connecting real identity or replacing mock persistence. Confirm that the committee can inspect a clause and navigate back to its source proposal.

### Step 3 Implement the database and access controls

Have Lovable prepare the schema, policies, and generated types in the isolated development environment. A reviewer checks proposed migrations and grants before they run. Confirm that anonymous users have no access to consultation data and that members can read submitted content but only their own private drafts.

Implement atomic proposal submission, revision, position, and draft operations where multiple related writes must succeed together. Test direct database/API access as well as the interface.

### Step 4 Implement synthesis and the policy draft

Add human tags, reviewed summaries, minority positions, proposal links, and clause provenance. Add assignment of review owners and follow-up actions. Keep automatic AI coding and policy generation out of version one.

### Step 5 Prepare reporting

Create curated analytics views and a dedicated read-only BI account. Deliver the Power BI model and reports outside the Lovable generation workflow using the verified database contract. Reconcile every metric against the source records.

### Step 6 Deploy a Netlify preview

Target React, TypeScript, and TanStack Start for the new build. Inspect the generated package manifest and deployment configuration; configure the current Netlify TanStack Start adapter instead of assuming a plain static dist deployment. Remove host-specific dependencies that prevent Netlify operation and test the deployed server boundary.

Set environment-specific callback URLs and secrets in managed configuration. Store only publishable client configuration in browser code. Build from the synced GitHub repository using a reviewed branch; production releases follow reviewed merges and deployment controls.

### Step 7 Validate and obtain institutional readiness

Run Lovable's available security scans and review findings. Independently test authorization, persistence, concurrency, exports, accessibility, and deployed routes. OTS must confirm hosting, identity, vendors, data classification, retention, backup, and licensing before a real pilot.

### Step 8 Pilot and retain an activation candidate

Conduct the same role-diverse pilot as the primary plan, after institutional prerequisites are resolved. Record the tested commit, schema version, deployment configuration, report version, restore procedure, and known issues. The backup becomes an activation candidate only when the acceptance checks pass.

## Power BI data flow

The reporting direction is: participant contribution, PostgreSQL record, human analysis, curated analytics view, Power BI Import model, authenticated report distribution.

Use the PostgreSQL connector and a dedicated read-only account, with encrypted connectivity and tested refresh. [Microsoft PostgreSQL connector](https://learn.microsoft.com/en-us/power-query/connectors/postgresql). Choose the administered Supabase connection endpoint compatible with the network, including the session pooler for an IPv4-only path where appropriate. [Database connectivity](https://supabase.com/docs/guides/database/connecting-to-postgres).

Deliver the same five report pages as the primary route: participation, question coverage, themes and risks, support and reservations, and draft traceability with follow-up.

Count unique participants and current proposals without multiplying totals through comments or tags. Keep collective outputs separate from individual responses. Use a verified invitation roster for participation percentages. Measure support among recorded positions on the relevant proposal version. Preserve disagreement and missing evidence in committee reports.

Set daily refresh and an additional refresh after a consultation round as the pilot default, subject to tested tenant capacity. Assign a BI owner and show the latest successful refresh. General reports use aggregates and reviewed excerpts, with unnecessary identity fields excluded from the model.

The Lovable Power BI connector is not required in version one. Use links to authenticated reports. Any later connector integration is a separate enhancement for reading governed measures and requires its own identity and authorization assessment. Do not use a shared connection to expose restricted models to every participant.

Confirm Power BI licenses and permissions with OTS. Do not use Publish to web for this consultation. [Sharing requirements](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards), [public publishing behavior](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web).

## Compatibility migration and activation

### Development isolation

Keep the Lovable development project separate from the primary production database. Use the same data definitions with fictitious fixtures. Do not assume that sharing a Supabase project between development applications is harmless; the development integration can modify backend configuration.

### Cutover procedure

1. Confirm the reason for activating the alternative and designate the release owner.
2. Record a compatible application commit, schema version, analytics views, and report version. Verify the backup can read and write the production contract in a controlled test environment.
3. Take database and file snapshots, temporarily close contribution submission, and confirm pending saves have completed.
4. If the primary route already uses the agreed Supabase production backend, connect the independently deployed backup runtime to that backend without exposing production to the Lovable development integration. Reuse identity and IDs and avoid a data copy.
5. If the only existing data is in the original dashboard stores, import snapshots into the approved backend using a tested, idempotent mapping. Preserve the old question catalog, timestamps, declared authors, legacy IDs, and provenance. Mark historical identities as unverified.
6. Test institutional sign-in, memberships, private drafts, submitted proposals, files, positions, history, and draft links. Reconcile record totals and Power BI output.
7. Route the consultation entry point to the validated Netlify release and reopen contributions. Keep the old application read-only during the rollback window.
8. Monitor failed saves, access errors, and report refresh. Record the cutover outcome.

Rollback uses the previous validated application against a compatible database contract. If a data migration occurred, preserve post-cutover writes before restoration and reconcile them; do not restore a snapshot in a way that silently discards new contributions. Test the rollback procedure before activation.

This backup addresses a development or interface replacement need. It does not independently recover a Netlify outage, a Supabase outage, or institutional identity unavailability. Those require operational recovery arrangements in addition to this alternative plan.

## Initial Lovable build brief

The following brief is ready to use after the development workspace and isolated backend are configured. Attach the full question bank and this plan as project knowledge.

> Build an English-language consultation application called North Harris AI Policy Working Tables for Lone Star College North Harris faculty, adjuncts, and staff at every organizational level. Use React and TypeScript with the current TanStack Start stack and prepare the application for Netlify deployment. Connect only to the independently owned Supabase development project configured for this work; use fictitious records during development. Implement the six working tables and exact twenty-four questions supplied in the project knowledge. Participants must be authorized consultation members. Private drafts belong only to their authors; submitted proposals show verified names, employment category, and unit to authorized members. Implement proposal revisions, comments, collective authorship context, Support, Support with changes, and Disagree with rationale, human coding, reviewed synthesis, and a versioned policy draft whose clauses link to source proposals and references. Enforce access rules in the backend and database rather than only in the interface. Preserve Kayla Almaguer attribution for PRIMER, its presentation, day/night themes, accessible mobile navigation, and print/PDF output. Do not add automated AI analysis or drafting. Prepare curated read-only analytics views for Power BI ingestion from PostgreSQL. Start with a fictitious-data interface and explain proposed schema changes before applying them. Follow the specification's acceptance criteria and keep real institutional data and privileged credentials out of prompts, browser code, and GitHub.

## Acceptance criteria and delivery package

The alternative is complete when the following evidence is available:

- All six tables and exactly twenty-four initial questions match the approved wording.
- A participant can submit across tables, resume private drafts, and see their own contribution history.
- Unauthorized users cannot access consultation data, private files, or reports.
- A participant cannot change another participant's contribution or elevate their role, including through direct API requests.
- Group proposals remain distinguishable from individual responses.
- Concurrent and repeated requests do not lose or duplicate records.
- Position history remains tied to proposal versions and reconfirmation is required after changes.
- A committee editor can build a draft clause and trace it to evidence and reservations.
- Schema and data exchange tests demonstrate compatibility with the primary plan.
- Power BI metrics reconcile with the database and use documented denominators.
- Netlify deep links, server functions, authentication callbacks, sign-out, and protected downloads work in the deployed preview.
- Keyboard, screen-reader, mobile, theme, presentation, and print workflows are verified.
- Security findings have been reviewed and unresolved release-blocking issues are recorded.
- Backup restoration and the activation/rollback procedure have been rehearsed.

Deliver the GitHub source repository, reviewed schema migrations and seed content, environment configuration guide, permission matrix, deployment guide, Power BI model and report definitions, test evidence, and activation/rollback instructions. Do not include secret values in the handoff documents.

## External prerequisites and cost review

Before real participation, confirm a designated owner for Lovable, GitHub, Netlify, Supabase, identity registration, Power BI, and ongoing support. OTS and the relevant institutional reviewers must confirm vendor suitability, hosting region, institutional access, retention, backup, and the policy review route.

Budget development usage in Lovable separately from hosting, database, storage, backups, and Power BI. Check current subscription and capacity requirements during provisioning; this plan does not assume that a free development tier provides acceptable production availability or institutional compliance.

The same scope applies as in the primary plan: employees of North Harris participate first; students and dual-credit partners are considered affected populations unless a later phase grants them access. Committee synthesis remains human, and policy adoption follows LSC authority rather than application voting.

Saving this plan does not create a Lovable project, purchase subscriptions, deploy an application, or alter the existing application code.
