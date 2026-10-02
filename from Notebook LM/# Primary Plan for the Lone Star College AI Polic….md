# # Primary Plan for the Lone Star College AI Polic…

Primary Plan for the Lone Star College AI Policy Application

Date: October 1, 2026

Status: Final English planning document for review; the policy-consultation features have not been implemented. A separate React/TanStack portability preparation is documented in

the platform guide

LOVABLE\_IMPORT\_GUIDE.md

Delivery approach: Extend the existing application and continue hosting on Netlify.

#### Companion document:

Lovable backup plan

AI\_Policy\_Application\_Lovable\_Backup\_Plan.md

Purpose and agreed decisions

Transform the current North Harris working-session dashboard into a participatory application where faculty, adjuncts, and staff at every organizational level can develop recommendations for an AI use policy at Lone Star College. The application will preserve original contributions, support discussion and human analysis, feed Power BI, and produce a versioned policy draft that can be traced back to its supporting proposals and sources.

#### The user selected the following product decisions during planning:

Six thematic working groups, called working tables in the application.

Hybrid participation: individual contributions before and after meetings, combined with facilitated group discussion. Every authorized participant can contribute to all six tables.

Contributors' names are visible to authorized consultation participants.

English interface, questions, and institutional reports.

Human coding and synthesis of proposals, with quantitative indicators. AI-assisted analysis may be evaluated later with OTS.

Participants express support, support with changes, or disagreement, with a rationale. These positions inform the committee and do not enact policy.

The consultation produces proposals, a synthesis report, and a versioned policy draft.

Netlify remains the hosting target. Infrastructure, institutional access, costs, and Power BI licenses must be confirmed with the Office of Technology Services, or OTS.

The application supports policy development. It does not grant the North Harris committee authority to approve system policy or approve AI tools for institutional use.

Research on US higher education initiatives

The following official sources were consulted on October 1, 2026. This is a targeted comparison of relevant institutional initiatives, not an exhaustive national survey. Approved policies, operational guidance, and working drafts have different status and must remain distinguishable in the application's reference library.

Institution or initiative

Relevant findings and implications

Lone Star College OTS

LSC already provides guidance on confidential data, tool evaluation, content review, academic expectations, and training. The consultation should build on this baseline and identify additions or clarifications.

Official guidelines

https://www.lonestar.edu/OTS-AI-Guidelines

Austin Community College

ACC's published guidance states that all syllabi must include an AI policy as of June 2025. It offers prohibited, permitted, and required use options, with rationale, assessment, resources, and exceptions. It also addresses disclosure and detector limitations.

Syllabus guidelines

https://offices.austincc.edu/institutional-effectiveness-and-grant-development/master-syllabi/artificial-intelligence-draft-policies/

Maricopa Community Colleges

Its academic misconduct regulation explicitly includes unauthorized generative AI use and provides consequences and appeal procedures. This illustrates integration into existing academic rules.

Regulation 2.3.11

https://district.maricopa.edu/administrative-regulations/2-students/2-3

Minnesota State

Its guidance connects AI to intellectual property, copyright, security, and equity. The retrieved version is labeled a March 2025 draft and explicitly states that it is not a new board policy.

System guidance

https://www.minnstate.edu/system/asa/innovations/docs/minnesota-state-generative-ai-guidance.pdf

South Georgia State College

Its policy took effect in March 2026 and identifies approval by the President's Cabinet and Faculty Assembly. It addresses governance, tool inventory, vendors, disclosure, human oversight, and periodic review.

Institutional policy

https://www.sgsc.edu/content/userfiles/files/SGSC%20AI%20Policy.pdf

Its acceptable-use guidance connects permitted use to data classification, contracts, tool review, and meaningful human oversight of consequential decisions. Its internal rules should be studied without assuming automatic applicability to LSC.

Acceptable use guidance

https://security.utexas.edu/ai-tools

Its guidance distinguishes public tools from tools approved for confidential data and retains human responsibility for published content.

Institutional guidelines

https://www.huit.harvard.edu/ai/guidelines

University of Michigan

Its committee reports document a participatory process involving faculty, staff, and students, followed by institutional discussion.

Committee reports

https://genai.umich.edu/committee-reports

NIST's voluntary AI Risk Management Framework provides a complementary structure: Govern, Map, Measure, and Manage. The proposed application can use these functions to organize accountability and evaluation; they are not presented as mandatory LSC rules.

NIST AI RMF Playbook

https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook

Implications for the consultation

#### The following are design recommendations derived from the comparison:

Separate general principles, academic expectations, and administrative procedures.

Discuss permissions by activity, tool, and data classification.

Include transparency, human oversight, accessibility, review, and appeal pathways.

Allow discipline-specific decisions within shared institutional expectations.

Identify responsible offices, evidence requirements, review dates, and corrective actions.

LSC publishes a data classification and AI tool comparison. Working tables may recommend changes, but the application must identify OTS as the source of official tool approvals. Record when reference information was checked rather than presenting a participant-generated list as an approved catalog.

LSC data levels and tools

https://www.lonestar.edu/OTS-AI-Tools

LSC's Policy Manual states that changes to policies in that manual require Board of Trustees approval. The route for this project's recommendations must be confirmed based on whether the proposed instrument is a board policy, procedure, or guideline.

LSC Policy Manual

https://www.lonestar.edu/policy.htm

Before a real consultation launches, the designated institutional reviewers must also check applicable internal handbooks and procedures. This public-source review does not establish that all internal LSC requirements have been inspected.

Current application assessment

At the start of planning, the repository contained a vanilla HTML, CSS, and JavaScript application with three working tables and eleven questions. That source is now preserved in

, while a React/TanStack compatibility shell prepares the same dashboard for platform portability. The question audit below remains an assessment of those original three tables. Its content derives from

AI in Education and Workplace — North Harris Working Session

https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit

The assessment is based on the local code and the retrieved source document. It does not establish how many participants or proposals are stored in the deployed application.

Coverage of the eleven existing questions

The questions below are summarized rather than quoted. A gap means that the existing question does not explicitly elicit the corresponding policy decision or needs a more specific prompt.

Existing question

Missing or insufficiently developed

#### Relevant comparisons

1.1 PRIMER and assignment redesign

Pedagogy and evidence of learning.

AI permissions at each stage, disclosure, and assessment of human contribution.

ACC; Minnesota State.

1.2 Preparation for an AI-enabled workplace

Career readiness and AI literacy.

Observable competencies, output verification, and professional responsibilities.

1.3 Learning support and disability

Benefits, dependence, and accessibility.

Equivalent alternatives, costs, barriers, and accommodation procedures.

Minnesota State; SGSC.

1.4 A discipline-specific example

Disciplinary diversity and concrete use.

Risk, evidence, professional restrictions, and evaluation criteria.

UT Austin; SGSC.

2.1 Informal uses and expected savings

Productivity and potential pilots.

Inventory, measurable results, service quality, and error-correction costs.

SGSC; NIST.

2.2 Tools and confidential data

Privacy and tool approval.

Data classification, retention, vendor training use, procurement, and incidents.

LSC; UT Austin; Harvard.

2.3 Non-negotiable human judgment

Human oversight.

Specific decisions, accountable person, review evidence, and challenge pathways.

UT Austin; SGSC; Maricopa.

2.4 Budget and job security

Licensing, workload, and employment concerns.

Full costs, affected employee participation, and implementation conditions.

SGSC; NIST.

3.1 Familiarity and training

Gaps and training formats.

Verified North Harris baseline, role-based competencies, and adjunct access.

LSC; Minnesota State.

3.2 Access and consistent integrity rules

Equity and cross-college consistency.

Syllabus minimums, disclosure, detectors, appeals, and dual-credit partners.

ACC; Maricopa.

3.3 Measures, frequency, and ownership

Indicators and follow-up.

Definitions, denominators, sources, success criteria, and corrective action.

SGSC; NIST.

The source document contains details that became less explicit in the application, including FERPA, dual-credit partners, and specific workplace uses. Restore these as identifiable discussion cases and data fields.

PRIMER alignment

PRIMER is used as described in the source document, which attributes the framework to Kayla Almaguer. No separate public publication was identified in the research to verify an additional authoritative version. Preserve visible attribution in both the presentation and printed output.

PRIMER quality

Current situation

Proposed application behavior

Process-Oriented

Process is explained, but contributions remain separate notes.

Track proposal versions and decisions through to draft clauses.

Reflection appears in the presentation.

Request revision rationale and end-of-round reflection.

Interactive

Notes are shared.

Enable comments, questions, replies, and reasoned positions.

Multi-Modal

Files and presentation surfaces exist.

Accept structured text and supporting visuals or documents with accessible descriptions.

Real problems are presented, but follow-through is limited.

Show how contributions were considered and allow participation across tables.

The content connects to disciplines and work.

Link proposals to a use case, affected people, and an expected result.

Translate the eight PRIMER stages into the consultation workflow: preparation, research, collaboration, work with cases, presentation, feedback, pilot application, and reflection.

The main topics requiring additional attention are disclosure, authorship and copyright, consequential decisions, bias, appeals, vendors, retention and incidents, policy authority, and evidence linking contributions to the draft.

Six working tables and the initial question bank

Each table has four central questions, for a total of twenty-four. These are proposed consultation questions, not policies already adopted by LSC. All authorized participants can contribute to every table. Do not require completion of all twenty-four questions during a single meeting.

Table 1 Teaching Learning and Assessment

Deliverable: AI use criteria and examples of activities designed with PRIMER.

Which learning outcomes must students demonstrate through their own thinking and performance?

Which AI uses should be prohibited, permitted, or required at each stage of an assignment?

What evidence should demonstrate a student's learning process when AI is used?

What discipline-specific activity would develop responsible AI skills for students' future work?

Table 2 Academic Integrity Transparency and Intellectual Property

Deliverable: Shared expectations for disclosure, integrity, authorship, and case review.

What should students and employees disclose about their use of AI?

What common AI expectations should appear in every syllabus and assignment?

What evidence and review process should be required before finding AI-related academic misconduct?

What safeguards should apply when AI is used with copyrighted materials, research, or institutional publications?

Facilitator guidance for question 3: discuss detector limitations, additional evidence, the student's response, and appeal procedures.

Table 3 Data Privacy Security and Tool Procurement

Deliverable: Proposed data and use matrix, vendor requirements, and review procedure.

Which institutional data may be entered into each category of approved AI tool?

What information must a vendor provide before an AI tool is considered for institutional use?

What process should employees follow to request, pilot, and review an AI tool?

What should happen when an AI tool exposes data or materially changes its features or terms?

Facilitator guidance: use student, employee, financial, and relevant clinical data cases, including AI features embedded in existing software.

Table 4 Workplace Use Student Services and Human Accountability

Deliverable: Prioritized use cases and operational boundaries for human oversight.

Which workplace or student-service tasks would benefit from an AI pilot?

Which decisions must remain under a qualified employee's authority?

How should people be informed when they interact with AI or receive an AI-assisted decision?

What conditions would make an AI pilot acceptable to the employees whose work it affects?

Facilitator guidance: represent advising, admissions, HR, finance, libraries, communications, IT, academic functions, and campus operations. Include service quality, bias, human assistance, workload, and decision review.

Table 5 Equity Accessibility and Professional Development

Deliverable: An access and training plan by role, explicitly including adjuncts.

What barriers prevent faculty, adjuncts, or staff from participating in responsible AI use?

What equivalent alternatives should be available when an AI tool is inaccessible or unavailable?

What AI competencies should employees demonstrate in their particular roles?

What training arrangements would make participation practical across schedules and employment categories?

Facilitator guidance: consider costs, devices, disability, language, experience, and available time.

Table 6 Governance Implementation and Evaluation

Deliverable: Responsibilities, institutional review route, and monitoring indicators.

Which principles should apply across LSC, and which decisions should remain discipline- or unit-specific?

Who should review, authorize, implement, and periodically update AI rules and procedures?

What indicators and evidence should determine whether an AI policy or pilot is working?

What process should address exceptions, unresolved disagreements, and requests to revise the policy?

Facilitator guidance: distinguish the North Harris committee, system authorities, and operational owners.

Common contribution structure

Collect the observed issue, a concrete recommendation, rationale, example, affected people, risks, and available evidence. Evidence may be a cited source, a clearly identified experience, or an acknowledged information gap. Allow participants to select insufficient information or not applicable to my role without fabricating an answer.

The individual and meeting workflows use the same questions and contribution structure. A facilitator may submit a group proposal, but must identify it as collective and record the group context separately from individual responses.

Application experience and collaboration rules

Provide six main application areas: orientation and sources, working tables, proposals and discussion, committee synthesis, policy draft, and indicators.

Participation and visibility

Verify access and require membership in the consultation.

Show contributor name, employment category, and unit on submitted proposals to authorized consultation members.

Keep email addresses, authentication information, and private drafts outside the shared participant view.

Keep drafts private until the author submits them.

Distinguish individual contributions from collective proposals. A group proposal does not automatically count as an individual response from every attendee.

Store one current position per participant and proposal version: Support, Support with changes, or Disagree, with a rationale.

Keep earlier positions in history when a proposal changes. Participants must reconfirm their position on the new version.

Link similar proposals without deleting originals or minority views.

Let a participant amend their own work while preserving revision history. Moderation must record its reason and preserve the original through controlled access.

Application roles are participant, facilitator, committee analyst or editor, and administrator. A member may hold more than one application role. Employment category and organizational level are descriptive attributes, not permission grants.

Every draft clause must link to supporting proposals and sources, identify unresolved reservations, and show its review status. A participant position is a consultation signal; only authorized institutional processes can adopt policy.

Reference and file handling

The reference library must distinguish existing LSC requirements, external institutional examples, PRIMER, and new committee proposals. Record title, source URL, document status, and verification date.

Support optional documents and images up to the existing 5 MB limit in private storage. Require a short accessible description; require text alternatives for relevant visual content. Restrict accepted uploads to PDF, DOCX, TXT, MD, PNG, and JPEG, validate content types, and exclude executable content. Multimodal evidence supports discussion; structured text remains necessary for analysis.

Preserve the PRIMER presentation, day and night themes, and print/PDF output. Keep the interface clear about consultation drafts and institutional review status.

Target architecture and data design

Hosting and identity

Keep the existing HTML, CSS, and JavaScript frontend on Netlify. Use Netlify Functions for validated application operations. Recommend independently administered Supabase PostgreSQL, Supabase Auth, and private file storage as the backend.

Use Microsoft Entra through Supabase Auth for institutional sign-in, restricted to the LSC tenant, followed by consultation membership checks. Restrict access using verified identifiers and a maintained membership record rather than email suffix alone or user-editable role claims.

Supabase Microsoft authentication

https://supabase.com/docs/guides/auth/social-login/auth-azure

Validate authentication, membership, and operation permissions on the server. Apply explicit database grants and row-level security policies to exposed data. Keep privileged keys out of frontend bundles and use user-scoped access for ordinary participation operations.

Supabase API security

https://supabase.com/docs/guides/api/securing-your-api

OTS must confirm Netlify, Supabase, identity configuration, data classification, operating costs, backup, and retention arrangements before real institutional contributions are collected. Use fictitious data for prototypes until that confirmation. If the proposed architecture is unacceptable, revise the architecture before the real pilot rather than silently switching providers.

Data entities

Organization

Consultations, rounds, participant profiles, memberships, and roles.

Working tables, stable questions, question versions, and reference sources.

Participation

Proposals, proposal revisions, collective authorship context, comments, and positions.

Human-assigned tags, synthesis records, review responsibility, and recorded disagreements.

Drafts, clauses, draft versions, and links to proposals and sources.

Actions, owners, due dates, status, and an audit history.

Use stable identifiers and separate question versions. Reordering questions must not relabel existing responses. Once a round opens, substantive question changes create a new version; prior responses remain attached to their original version.

Store timestamps in UTC and display consultation dates in America/Chicago. Store participant identity separately from reporting attributes, and use the minimum necessary identifiers in analytics.

Application interfaces and persistence

Replace the shared whole-document state endpoint with operations on consultations, questions, proposals, revisions, comments, positions, synthesis, drafts, actions, and controlled exports. Derive the author from the verified session. Validate referenced records, consultation membership, active round, and role before accepting an operation.

Current Netlify functions do not verify identity or permissions within those handlers and allow replacement of the whole shared state. The new application must remove that behavior from the production participation path.

Confirm database persistence before displaying Saved. Identify pending and failed saves explicitly. Retries must use a stable request identifier to avoid duplicates. Concurrent edits must detect version conflicts rather than overwriting a colleague's work. Keep local drafts scoped to the authenticated user and clear them at sign-out; do not make browser storage the authoritative contribution store.

Existing data migration

Inventory existing data in the configured GitHub state file, Netlify Blobs, and voluntarily exported browser drafts. Snapshot the source before import and perform a dry run.

Preserve original question, timestamp, source location, declared author, and legacy identifier. Retain the original eleven-question catalog as historical content, with an explicit crosswalk to the new topics rather than falsely assigning old answers to newly worded questions. Mark legacy names as unverified identities until an authorized reconciliation occurs.

Keep GitHub for code, reviewed schema migrations, and reference content. Do not commit real participant proposals or uploaded institutional files into the code repository.

Human analysis and Power BI

The committee will classify contributions using a documented catalog of themes, risks, policy scope, and recommended actions. Analysts can assign multiple labels, but must retain original text and reviewer identity. Synthesis must distinguish agreement, reservations, minority positions, and missing evidence.

Version one excludes automated AI coding or drafting. A later AI-assisted workflow would require a separate assessment of an OTS-approved tool and human review of its outputs.

Reporting pages

Participation by employment category, unit, organizational level, and round.

Coverage of working tables and questions.

Themes, risks, and recommendations.

Support, requested changes, and disagreement.

Draft traceability and follow-up actions.

Count unique participants and current proposals at their intended grain. Joining comments or multiple tags must not inflate counts. Group proposals and individually confirmed responses are distinct measures. Category totals must not imply that overlapping attributes are mutually exclusive.

Calculate participation percentages only against a verified invitation roster and label the denominator. Without that roster, show counts. Calculate support among people who recorded a position on the relevant proposal version; nonresponses are not support. Multiple theme assignments may yield percentages that do not total 100 percent, which must be explained. Do not present consultation participation as proof of population representativeness.

Connection and distribution

Use Power BI's PostgreSQL connector in Import mode, a dedicated read-only account, and curated analytics views. Microsoft documents PostgreSQL connectivity for Power BI.

PostgreSQL connector

https://learn.microsoft.com/en-us/power-query/connectors/postgresql

Test encrypted connectivity, credentials, network restrictions, and scheduled refresh with OTS. Use the compatible Supabase session-pooler endpoint if the network requires IPv4; record the actual endpoint from the administered project rather than inventing it.

Supabase connection guidance

https://supabase.com/docs/guides/database/connecting-to-postgres

Set a daily refresh as the pilot default, plus a refresh after each closed consultation round, subject to tested tenant capacity and ownership. Display the most recent successful refresh and assign a report owner to monitor failures.

General reports use aggregate data and reviewed excerpts. Keep unnecessary personal identifiers out of the semantic model instead of merely hiding columns. Distribute reports through authenticated Power BI access with confirmed licensing.

Power BI sharing

https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards

Do not use Publish to web for consultation data; it exposes reports publicly.

Publish to web documentation

https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web

. Version one can link to authenticated reports from the application; embedded reporting is not required for the first release.

Delivery stages

Deliverable and exit condition

1 Institutional baseline

Source inventory, coverage matrix, reviewed question bank, relevant internal requirements, and a confirmed institutional route for recommendations.

2 Reviewable prototype

Complete fictitious-data workflow: contribute, discuss, express a position, synthesize, and trace a draft clause. Review clarity and accessibility.

3 Infrastructure

Database, institutional access, permissions, backup, and a tested Power BI connection. OTS resolves production prerequisites.

4 Pilot across roles

Include faculty, adjuncts, and staff from different levels and units. Test meetings and asynchronous participation and correct observed barriers.

5 Expanded consultation

Open all six tables to the authorized North Harris community, publish participation windows, and inspect coverage for missing voices.

6 Synthesis and draft

Deliver a report, Power BI dashboard, and versioned policy draft with supporting evidence, disagreements, and open issues for institutional review.

The first implementation deliverable is the complete prototype with fictitious data and the twenty-four questions, accompanied by the data model and concrete OTS requirements. Planning does not authorize external provisioning, subscription purchases, or public deployment.

Responsibilities and operating decisions

The committee owns question content and synthesis. A designated application administrator maintains memberships. OTS confirms identity and infrastructure suitability. A designated BI owner maintains reports and refresh. Relevant institutional reviewers confirm policy authority, applicable requirements, and retention rules. Assign named people to these responsibilities before the real pilot.

Dates, invitation roster, retention schedule, hosting region, licensing, and production resource identifiers remain external prerequisites. Record them during stages 1 and 3. Their absence does not block a fictitious-data prototype, but does block collection of real contributions.

Acceptance and verification

A participant can contribute to all six tables and resume a private draft.

A participant cannot read another person's private draft, modify another person's contribution, or grant themselves permissions.

Submitted names are visible only within authorized consultation access.

Collective and individual contributions remain distinguishable in analysis.

Concurrent saves and repeated requests neither lose nor duplicate proposals.

New question or proposal versions preserve historical responses and positions.

Moderation and analyst revisions have an attributable reason and history.

Existing data imports retain counts, original wording, timestamps, and provenance.

Power BI totals reconcile to the source database and use defined denominators.

Every draft clause exposes its supporting proposals and unresolved reservations.

The interface works on mobile devices, with keyboard navigation, and with a screen reader.

PRIMER attribution remains visible in presentation and print/PDF output.

A backup restoration is tested before real participation begins.

Release validation checks the complete path from institutional sign-in to persisted contribution, committee review, and refreshed report.

Scope and defaults

The first consultation is for North Harris employees. The structure supports later consultations at other LSC colleges. Students and dual-credit partners are affected populations discussed in the questions; granting them participant access requires a later, specifically defined phase.

Do not require a single meeting to handle the entire question bank. Schedule consultation windows and facilitated sessions to support different shifts and adjunct availability. Unknown or not-applicable responses must remain visible as coverage gaps rather than being treated as missing compliance.

The source repository and existing application remain unchanged by saving this planning document. Subsequent implementation is a separate task.

