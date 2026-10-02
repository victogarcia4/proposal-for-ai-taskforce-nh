# Primary Plan for the LSC-North Harris AI Use Norms Consultation Application

Version: 2  
Date: October 2, 2026  
Status: Planning document for review. Supersedes [version 1](AI_Policy_Application_Plan.md), which is kept unchanged for reference. The consultation features have not been implemented.  
Delivery approach: Extend the existing React/TanStack Start repository and deploy on Netlify.  
Companion document: [Lovable backup plan, version 2](AI_Policy_Application_Lovable_Backup_Plan_v2.md).

## 1. Goal

Build and launch an application that gathers contributions from Lone Star College-North Harris faculty, adjuncts, and staff, and turns them into a traceable, versioned draft of **AI use norms for LSC-North Harris**.

The application is finished when a North Harris employee can sign in, respond in a few minutes or write a full proposal, see what colleagues proposed, and later see what happened to their contribution; and when the committee can code the contributions, publish a draft set of norms for comment, and hand a final draft to the people with authority to adopt it.

### What changed from version 1

| Area | Version 1 | Version 2 |
| --- | --- | --- |
| Outcome | A policy draft for Lone Star College. | Norms for North Harris, each one routed to the body that can act on it (section 4). |
| Evidence base | Institutional policies and guidance. | Adds seven sources on how faculty and staff actually experience AI and what makes participatory AI governance work (section 2). |
| Participation | One contribution form. | Two depths: a quick response and a full proposal, plus an optional baseline pulse (section 6). |
| Feedback to participants | Draft traceability. | Adds a recorded disposition for every proposal and a public "What we heard, what we did" page (section 6). |
| Review of the draft | Committee synthesis. | Adds a comment round on the draft norms before they are finalized (section 6). |
| Reporting | Role and unit coverage. | Adds coverage by discipline cluster and by AI experience, because national data show these drive opinion (section 9). |
| Delivery | Six stages ending in a draft. | Three releases ordered by the goal: collect, synthesize, draft (section 10). |
| Frontend baseline | Vanilla HTML, CSS, and JavaScript. | The React/TanStack Start shell already in the repository. |

Decisions carried over from version 1 without change: six working tables, hybrid participation, English interface, human coding and synthesis, three reasoned positions (Support, Support with changes, Disagree), Netlify hosting, and OTS confirmation before real data is collected.

## 2. Evidence base

The folder `from Notebook LM/` holds 25 source captures. They fall into three groups. Section 2.4 lists the limits of these captures.

### 2.1 What LSC already has

| Source | What it establishes for this project |
| --- | --- |
| [LSC OTS initial best practices](https://www.lonestar.edu/OTS-AI-Guidelines) | LSC already tells employees not to enter confidential data into public AI tools, to contact OTS before procuring AI tools, to take responsibility for AI-generated content they publish, and asks faculty to clarify AI expectations with students. Training is offered through the employee training tool. The norms must build on this, not restate or contradict it. |
| [LSC data levels and tools](https://www.lonestar.edu/OTS-AI-Tools) | OTS publishes a tool comparison with a data classification level per tool. In the captured copy, Copilot for Microsoft 365 is "currently in testing" and Adobe Firefly/Express is available, both at Low–Medium; ChatGPT and Claude are listed as "NOT approved for internal usage". The page must be re-read at build time, and OTS remains the only source of tool approvals. |
| [LSC Policy Manual](https://www.lonestar.edu/policy.htm) | Changing a board policy requires a majority vote of the Board of Trustees, and the manual controls over any inconsistent college guideline. The index lists sections the norms will touch: I.C.1.05 Participatory Governance, V.F Student Discipline for Academic Misconduct, V.G Student Final Grade Appeal, V.I Academic Freedom and Responsibilities, IV.E.3 and VI.D.11 disability accommodations, IV.E.6 Employee Grievance, VIII.A.1.4 Prohibited Technologies, and VIII.A.1.8 Safeguarding Information. Many sections have a Notice and Comment page, which is the model for the comment round in this plan. |
| [LSC-Online AI Task Force news](https://www.lonestar.edu/news/117242.htm) | A sister college already runs a monthly professor idea-share and takes part in the THECB AI Facilitated Learning Network (published October 2024). North Harris can coordinate with it and reuse the format. |

### 2.2 What participants are likely to bring

These are national findings, not North Harris data. The application's baseline pulse (section 6) lets North Harris compare itself with them.

| Source | Findings that shape the design |
| --- | --- |
| [College Board research brief](https://research.collegeboard.org/media/pdf/ai-research-brief-3-vf.pdf), survey of over 3,000 faculty, summer 2025 | 72% faced at least minor challenges managing student AI use. 49% had a formal course policy, 31% informal guidance, 20% neither. Only 21% feel very confident guiding AI use; 79% are starting out or still need guidance. Opinion divides sharply by discipline (66% of English faculty negative versus 25% in business and communications) and by experience (69% of faculty who have not used AI are negative versus 38% of users). Faculty at open-enrollment colleges are more positive than those at selective ones. One respondent said that leaving policy to each instructor "does not offer 'flexibility'" so much as it signals a lack of support. |
| [AAC&U and Elon University survey](https://www.aacu.org/newsroom/national-survey-95-of-college-faculty-fear-student-overreliance-on-ai-and-diminished-critical-thinking-among-learners-who-use-generative-ai-tools), 1,057 faculty, late 2025, described by its authors as non-scientific | 95% expect student overreliance and 90% expect weaker critical thinking. 87% have written their own course AI rules, yet only 48% say their institution has clear campus-wide guidelines and 35% say their department does. 68% say faculty have not been adequately prepared, and 67% say the same of non-faculty staff. |
| [WCET 2025 survey of institutional practices](https://wcet.wiche.edu/wp-content/uploads/sites/11/2025/08/WCET-Supporting-Governance-Operations-and-Instruction-and-Learning-Through-AI-2025.pdf), 224 responses, 36% from two-year public colleges | 31% of institutions have AI policies (8% in 2023) and 39% are writing them. Faculty champions (54%) and dedicated task forces (52%) are the most cited supports. 26% offer no AI training to administrators and staff, against 10% for faculty. 9% of respondents do not know their institution's policy status. The report names a tension between instructor autonomy and campus-wide rules, and several institutions chose adaptable guidelines over fixed policy because the technology changes faster than policy does. |

### 2.3 How to run a participatory process

| Source | Practice adopted in this plan |
| --- | --- |
| [Every Learner Everywhere and OLC playbook](https://www.everylearnereverywhere.org/blog/10-best-practices-for-generative-ai-faculty-development-insights-from-the-field/), February 2026 | Lead with ethics and transparency. Respect faculty choice and avoid mandates to use AI. Hold listening sessions to surface fears before discussing tools. Use discipline-specific cases. Support champions. Plan for the two main barriers, limited knowledge (84.6%) and lack of time (82.1%). Clarify policy, since 43.6% cite unclear policies. Review on short cycles. |
| [Community College Daily, Instructional Technology Council column](https://www.ccdaily.com/2025/02/empowering-faculty-to-lead-ai-decision-making/), February 2025 | Faculty-led, department-driven decisions. Ask whether AI is a skill accelerator, a skill replacer, or a skill distorter for each learning objective. Keep the discussion going, because one-time solutions go stale. |
| NotebookLM research report, October 1, 2026 | Four themes across the sources: preserve academic autonomy, support over policing, participatory task forces with regular idea-shares, and account for workload and equity, especially for adjuncts and staff. |
| [Austin Community College](https://offices.austincc.edu/institutional-effectiveness-and-grant-development/master-syllabi/artificial-intelligence-draft-policies/) | A shared-governance committee requires an AI statement in every syllabus, with eight elements and three modes (prohibited, permitted, required); each department engages its faculty; detectors may not be the sole evidence of dishonesty. This is the closest Texas community college model for "common baseline, local choice". |
| [South Georgia State College](https://www.sgsc.edu/content/userfiles/files/SGSC%20AI%20Policy.pdf), effective March 2026 | A complete small-college policy: principles, a governance group, a tool inventory, events that trigger immediate review, a default rule when a syllabus is silent, disclosure rules, annual review, and a notice that AI inputs and outputs may be public records. |
| [Minnesota State guidance](https://www.minnstate.edu/system/asa/innovations/docs/minnesota-state-generative-ai-guidance.pdf), March 2025 draft | Guidance that maps AI onto existing policies instead of creating new ones. Students cannot be compelled to accept a vendor's click-through terms, so an alternative must exist. Detectors show false positives, with higher rates for non-native English writers. |
| [UT Austin](https://security.utexas.edu/ai-tools), [Harvard](https://www.huit.harvard.edu/ai/guidelines), [University of Michigan](https://genai.umich.edu/committee-reports), [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook) | UT Austin ties permitted use to data classification and cites Texas law barring state agencies from letting AI control consequential decisions without meaningful human review. Harvard restricts AI meeting assistants to approved tools. Michigan shows committee reports written by faculty, staff, and students and published for discussion. NIST offers Govern, Map, Measure, Manage as a voluntary structure. |

### 2.4 Limits of the source set

- The capture of the North Harris working-session Google Doc contains only headings and interface text. The eleven-question audit in version 1 rests on the earlier retrieval and is not repeated here.
- The LSC Policy Manual capture is the index and the general statement, not the text of the sections. Each cited section must be read before a norm relies on it.
- Maricopa Community Colleges, cited in version 1, is not in the NotebookLM set. It stays in the reference library marked "not re-verified".
- Three items appear only as citations in the research report: an EDUCAUSE Review article on faculty skepticism and two articles from *Inquiry: The Journal of the Virginia Community Colleges*. They are not used as evidence here.
- Whether the Texas law cited by UT Austin applies to LSC, and whether contributions stored in the application are subject to the Texas Public Information Act, are questions for LSC legal review. This plan does not answer them.
- External policies describe other institutions. None is binding on LSC.

## 3. Design principles

Each principle comes from section 2 and is enforced by a feature in section 6.

1. **Start from what LSC already requires.** Every table opens with the existing LSC rule or guidance on its topic, so participants propose additions and clarifications.
2. **Common baseline, local choice.** Every proposal and every norm states whether it applies campus-wide, to a division or department, or is left to the instructor or unit.
3. **Skepticism is a contribution.** A concern, an objection, or a reason not to use AI is recorded and reported with the same weight as a recommendation. The application never assumes the participant uses or wants AI.
4. **Support over policing.** Questions on integrity ask about evidence, process, and teaching responses. No norm may rest on AI detection as sole evidence; that boundary is stated in the question bank.
5. **Respect people's time.** A useful response takes under five minutes on a phone. Depth is optional.
6. **Hear everyone.** Adjuncts and staff are named audiences with their own coverage indicators. The committee looks for missing voices before it closes a round.
7. **Close the loop.** Every submitted proposal receives a recorded disposition that its author can see.
8. **Norms are living.** Each norm carries a review date, and the application can reopen rounds.
9. **Humans analyze.** Version 1 of the application uses no generative AI to code, summarize, or draft.

## 4. Authority and the norms output

The North Harris committee can gather contributions and recommend. It cannot change board policy or approve AI tools. The application therefore records, for every draft norm, the route that makes it real.

| Field | Values |
| --- | --- |
| Scope | Campus-wide baseline; division or department; course or unit discretion. |
| Strength | Required; expected; recommended; not permitted. |
| Applies to | Faculty; adjunct faculty; staff; administrators; students (as an affected group); vendors. |
| Route | Adopt at North Harris; refer to OTS; refer to the system policy process; professional development request; already covered by an existing LSC rule. |
| Existing LSC rule | Link to the policy section or OTS guidance the norm relies on or clarifies, with the date it was checked. |
| Review date | Date by which the norm is re-examined. |

Before real contributions are collected, the designated institutional reviewers must confirm three things: who at North Harris can adopt campus norms, how recommendations reach OTS and the system policy process, and whether section I.C.1.05 Participatory Governance prescribes steps this consultation must follow.

A participant's position is a signal to the committee. It does not adopt anything.

## 5. Working tables and question bank, version 2

Six tables, four questions each. Identifiers T1Q1 through T6Q4 are stable; wording below is version 2 of each question. Questions marked *revised* differ from version 1. Probes are prompts for facilitators and for the help text beside each question; they are not separate questions.

Every table page opens with two short panels: **What LSC already says** and **What others have found**, each with source links and the date checked.

### Table 1 Teaching, Learning, and Assessment

Deliverable: criteria for AI use in coursework and examples of assignments designed with PRIMER.

1. T1Q1 *(revised)*: Which learning outcomes must students demonstrate through their own thinking and performance, and where does AI accelerate, replace, or distort the skill being taught?
2. T1Q2: Which AI uses should be prohibited, permitted, or required at each stage of an assignment?
3. T1Q3: What evidence should demonstrate a student's learning process when AI is used?
4. T1Q4: What discipline-specific activity would develop responsible AI skills for students' future work?

Probes: writing done outside class; large sections where redesign is costly; in-class and oral alternatives; what your discipline's employers expect.

### Table 2 Academic Integrity, Transparency, and Intellectual Property

Deliverable: shared expectations for disclosure, syllabus statements, and review of suspected misuse.

1. T2Q1: What should students and employees disclose about their use of AI?
2. T2Q2 *(revised)*: What minimum elements should every North Harris syllabus AI statement contain, and what rule should apply when a syllabus or assignment is silent?
3. T2Q3 *(revised)*: What evidence and review steps should be required before a finding of AI-related academic misconduct, given that detection tools alone are not reliable evidence?
4. T2Q4: What safeguards should apply when AI is used with copyrighted materials, research, or institutional publications?

Probes: the eight ACC elements; a prohibited, permitted, required model; first-offense conversations; the student's chance to respond; existing LSC misconduct and grade-appeal procedures; citation format.

### Table 3 Data Privacy, Security, and Tools

Deliverable: a proposed data-and-use matrix, a list of questions for OTS, and a request process.

1. T3Q1: Which institutional data may be entered into each category of AI tool?
2. T3Q2: What information must a vendor provide before an AI tool is considered for institutional use?
3. T3Q3 *(revised)*: What process should employees follow to request, pilot, and review an AI tool, including AI features that appear inside software LSC already uses?
4. T3Q4: What should happen when an AI tool exposes data or materially changes its features or terms?

Probes: student, employee, financial, and clinical data; AI meeting assistants and note-takers; free tools with click-through terms; students who decline a vendor's terms; public-records exposure of prompts and outputs.

### Table 4 Workplace Use, Student Services, and Human Accountability

Deliverable: prioritized use cases and the decisions that stay with a person.

1. T4Q1: Which workplace or student-service tasks would benefit from an AI pilot?
2. T4Q2: Which decisions must remain under a qualified employee's authority?
3. T4Q3: How should people be informed when they interact with AI or receive an AI-assisted decision?
4. T4Q4 *(revised)*: What conditions, including workload, training time, and job security, would make an AI pilot acceptable to the employees whose work it affects?

Probes: advising, admissions, financial aid, HR, finance, library, communications, IT, campus operations; grading and hiring; a path to a human; bias checks.

### Table 5 Equity, Accessibility, and Professional Development

Deliverable: an access and training plan by role, explicitly including adjuncts and staff.

1. T5Q1: What barriers prevent faculty, adjuncts, or staff from taking part in responsible AI use?
2. T5Q2: What equivalent alternatives should be available when an AI tool is inaccessible, unaffordable, or declined?
3. T5Q3: What AI competencies should employees demonstrate in their particular roles?
4. T5Q4 *(revised)*: What training formats, time, and recognition would make participation practical across schedules and employment categories?

Probes: cost and devices; disability and assistive technology; language; tiered training from basics to assessment redesign; hands-on sessions; champions and learning communities; paid time for adjuncts.

### Table 6 Governance, Implementation, and Evaluation

Deliverable: who decides what, the review route, and indicators.

1. T6Q1: Which norms should apply across North Harris, and which decisions should remain with a discipline, a unit, or an individual instructor?
2. T6Q2 *(revised)*: Which norms can North Harris adopt itself, and which must be referred to OTS or the system policy process?
3. T6Q3: What indicators and evidence should show whether a norm or pilot is working?
4. T6Q4 *(revised)*: How often should the norms be reviewed, and what process should handle exceptions, unresolved disagreements, and requests for change?

Probes: a standing group with faculty, adjunct, and staff seats; coordination with the LSC-Online AI Task Force; annual versus shorter review cycles; events that trigger an immediate review.

No session is expected to cover all twenty-four questions.

## 6. Application behavior

### Areas

1. **Orientation and sources.** Purpose, timeline, how contributions are used, who can see what, the reference library, and the PRIMER presentation with attribution to Kayla Almaguer.
2. **Working tables.** The six tables, their briefing panels, questions, and probes.
3. **Proposals and discussion.** Submitted contributions, comments, and positions.
4. **Committee workspace.** Coding, synthesis, dispositions, and follow-up actions.
5. **Draft norms.** The versioned draft, its sources, and the comment round.
6. **What we heard, what we did.** Themes, dispositions, and participation indicators for all members.

### Two depths of contribution

| | Quick response | Full proposal |
| --- | --- | --- |
| Time | Under five minutes. | Open. |
| Fields | Contribution type; a statement of up to about 600 characters; optional scope. | Contribution type; issue observed; recommendation; rationale; example; people affected; risks; evidence; scope; suggested strength; optional attachment. |
| Use | Counted and coded like any contribution. Can be expanded later by its author. | Can be linked to draft norms as a source. |

Contribution types: recommendation; concern or objection; practice to share; question for OTS or administration; information gap. "Not applicable to my role" and "I do not have enough information" remain valid answers and are reported as coverage gaps.

A facilitator can submit a collective proposal from a session. It is labeled collective, records the session, and never counts as an individual response from those present.

### Baseline pulse

An optional set of about six items at first sign-in and again when the consultation closes: overall sentiment toward AI in the participant's work, whether AI feels more like a challenge or an opportunity, confidence in handling AI in their role, whether they have used AI in their role, their main concerns from a short list, and whether they knew LSC's OTS guidance existed. Items are adapted from the question types in the College Board and AAC&U surveys so results can be set beside national figures; wording is written for this consultation and reviewed by the committee.

Pulse answers are reported only in aggregate, never beside a name, and no group smaller than a threshold set by the committee is displayed.

### Visibility and identity

- Access requires institutional sign-in and membership in the consultation.
- Submitted proposals show the author's name, employment category, and unit to consultation members. This is the version 1 decision and remains the default.
- **Decision to reconfirm:** the sources stress that skeptical and lower-power voices, adjuncts and staff in particular, speak more freely with some protection. A per-contribution option "show my name to the committee only" would address this. It is designed into the data model but disabled until the project owner decides.
- Drafts are private until submitted. Email addresses and sign-in details are never shown to other participants.
- The orientation page states plainly who can see contributions and that records held by the college may be subject to public-records requests, pending legal confirmation.

### Positions, comments, and revisions

- One current position per participant per proposal version: Support, Support with changes, or Disagree, with a reason.
- A new proposal version asks participants to reconfirm. Earlier positions stay in history.
- Authors revise their own work with history preserved. Moderation records a reason and keeps the original under controlled access.
- Similar proposals can be linked. Originals and minority views are never deleted or merged away.

### Closing the loop

Every submitted proposal receives one disposition from the committee: incorporated; incorporated with changes; referred to OTS; referred to the system policy process; referred to professional development; deferred, with a reason; not adopted, with a reason. The author sees it on their own page, and the "What we heard" page shows the totals.

### Comment round on the draft

When the committee publishes a draft, members comment norm by norm and record a position on each. The committee publishes a response summary before the final draft. This mirrors the notice-and-comment practice in the LSC Policy Manual.

### Practice library

Contributions of type "practice to share" that the committee approves appear in a browsable library: syllabus statements, assignment designs, workplace uses. This gives participants something useful during the consultation and continues afterward as the campus idea-share.

### Session conduct

Facilitated sessions are recorded by a human facilitator in the application. AI meeting assistants and note-takers are not used unless OTS has approved the tool for that purpose.

### Roles

Participant, facilitator, committee analyst or editor, and administrator. A member can hold more than one. Employment category, discipline, and unit describe a person; they grant nothing.

### Files, accessibility, and presentation

Optional attachments up to 5 MB in private storage: PDF, DOCX, TXT, MD, PNG, JPEG, with content-type validation and a required short description. The interface works on phones, by keyboard, and with screen readers. Day and night themes, the PRIMER presentation, and print/PDF output are preserved.

## 7. Architecture

### Frontend and hosting

Build on the repository as it stands: React, TypeScript, TanStack Start, Vite, the official Netlify adapter, Node.js 24. The current three-table dashboard is a React shell around a preserved browser controller (`src/lib/dashboard-controller.mjs`). New consultation areas are written as ordinary React routes and components. The legacy dashboard stays reachable as a read-only archive until its data is migrated, then the controller is retired.

### Backend and identity

- Supabase PostgreSQL, Supabase Auth, and private storage, in a project administered independently of any development tool.
- Sign-in through Microsoft Entra restricted to the LSC tenant, followed by a membership check against a maintained roster. An email suffix alone is not sufficient. [Supabase Microsoft authentication](https://supabase.com/docs/guides/auth/social-login/auth-azure).
- Row-level security and explicit grants on every exposed table. Privileged operations run in server functions. Privileged keys never reach the browser. [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
- Netlify server functions validate session, membership, role, active round, and input for every write, and derive the author from the session.

OTS must confirm Netlify, Supabase, the identity registration, the data classification of consultation records, costs, backup, and retention before real contributions are collected. Until then, all environments hold fictitious data. If OTS rejects a component, the architecture is revised before the pilot.

### Data model

| Group | Tables |
| --- | --- |
| Organization | consultations, rounds, sessions, profiles, memberships, role assignments, invitation roster |
| Content | working tables, questions, question versions, briefing panels, reference sources |
| Participation | contributions (quick or full), contribution revisions, collective authorship context, comments, positions, pulse responses, attachments |
| Analysis | code catalog, code assignments, syntheses, dispositions, linked-proposal groups |
| Norms | drafts, draft versions, norms, norm-to-contribution links, norm-to-source links, norm comments, norm positions, comment-round responses |
| Follow-up | actions, owners, due dates, audit events |

Profile attributes used for reporting: employment category (full-time faculty, adjunct faculty, staff, administrator), division or unit, discipline cluster (the thirteen categories used by the College Board survey, plus "not a teaching role"), years at LSC in bands, and campus role in the consultation. Self-reported AI experience lives with the pulse, not the profile.

Rules: stable identifiers; question wording changes create a new version and never relabel old answers; timestamps stored in UTC and shown in America/Chicago; identity stored apart from reporting attributes; pulse responses stored without a direct link to displayed identity.

### Persistence

"Saved" appears only after the database confirms. Pending and failed saves are shown as such. Each write carries a request identifier so a retry cannot duplicate. Concurrent edits are detected by version and never silently overwritten. Local drafts are scoped to the signed-in user and cleared at sign-out.

The existing `/api/state` and `/api/file` functions accept unauthenticated whole-state writes. They are removed from the participation path in Release 1.

### Existing data

Inventory the GitHub state file, Netlify Blobs, and any exported browser drafts. Snapshot, dry-run, then import into an archive consultation with the original eleven questions, timestamps, declared authors marked as unverified, and legacy identifiers. Old answers are not reassigned to new questions; a crosswalk shows which new question each old one relates to. Real contributions and uploads are never committed to the code repository.

## 8. Human analysis

The committee codes contributions against a documented catalog with four dimensions: theme, risk, scope, and suggested action. A contribution can carry several codes. The coder's identity and the original text are kept. Synthesis for each question states where there is agreement, where there are reservations, which minority positions exist, and what evidence is missing.

No generative AI codes, summarizes, or drafts in version 1. One source describes using AI to extract themes from large comment sets, and the committee may want that later. It would require a tool that OTS has approved for the data classification of these records, and human review of every output. In the captured OTS table, the only general-purpose assistant with a data level is Copilot for Microsoft 365, listed as in testing at Low–Medium, so this is a question for OTS and not a design assumption.

## 9. Power BI

### Report pages

1. Participation by employment category, unit, discipline cluster, and round, with adjuncts and staff shown separately.
2. Coverage of tables and questions, including "not applicable" and "not enough information".
3. Themes, risks, and contribution types, with concerns and objections shown beside recommendations.
4. Positions on proposals and on draft norms.
5. Dispositions, norm traceability, and follow-up actions.
6. Baseline and closing pulse, beside the national figures in section 2.2, with their caveats.

### Measurement rules

- Count unique participants and current contributions at their own grain. Comments and multiple codes must not inflate totals.
- Collective proposals and individual responses are separate measures.
- Participation percentages use the verified invitation roster as the labeled denominator. Without a roster, show counts.
- Support is calculated among people who recorded a position on that version. Silence is not support.
- Small groups are suppressed below the committee's threshold.
- Participation is not presented as proof that the respondents represent North Harris.
- National comparison figures are labeled with source, year, and sample, and the AAC&U figures are labeled non-scientific.

### Connection

Power BI's PostgreSQL connector in Import mode, a dedicated read-only account, and curated analytics views that exclude unnecessary personal identifiers. [PostgreSQL connector](https://learn.microsoft.com/en-us/power-query/connectors/postgresql). Use the Supabase session pooler if the network path is IPv4-only, taking the endpoint from the administered project. [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres). Refresh daily during open rounds and after each round closes, subject to tenant capacity. Distribute through authenticated Power BI access with licensing confirmed by OTS. [Power BI sharing](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards). Do not use Publish to web. [Publish to web](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web).

## 10. Implementation

Three releases, each usable on its own. Release 1 alone meets the core goal of gathering contributions.

### Release 0: Foundations

| Work | Exit condition |
| --- | --- |
| Confirm the adoption route, the invitation roster owner, and the visibility decision. | Named owners and written answers. |
| Send OTS the architecture, vendors, and data description. | OTS response recorded. |
| Committee reviews the version 2 question bank, briefing panels, and pulse wording. | Approved seed content. |
| Create the development database with schema, row-level security, and fictitious seed data. | Migrations reviewed and applied in development only. |

Release 0 needs no production services. Development continues on fictitious data if OTS has not yet answered.

### Release 1: Collect

Sign-in and membership; profile; orientation and reference library; six tables with briefing panels; quick responses and full proposals; private drafts; collective proposals; comments and positions; baseline pulse; practice-to-share submissions; administrator roster and round management; CSV export for the committee; removal of the legacy write path.

Exit condition: a role-diverse pilot group, including adjuncts and staff, completes contributions on phones and desktops, in a session and on their own time, with no lost or duplicated records, and a restore from backup has been tested.

### Release 2: Synthesize

Code catalog and coding workspace; linking of similar proposals; synthesis records; dispositions; author notifications of disposition; "What we heard, what we did" page; analytics views; Power BI pages 1 to 4.

Exit condition: every submitted proposal in the pilot has a disposition, and report totals reconcile with the database.

### Release 3: Draft and comment

Norm records with scope, strength, route, and review date; links from norms to contributions and sources; versioned drafts; comment round; response summary; print/PDF of the draft with its evidence; practice library; closing pulse; Power BI pages 5 and 6.

Exit condition: a draft in which every norm shows its sources, reservations, and route, delivered with the synthesis report to the confirmed adopting authority.

### After the first consultation

Reopen rounds on the review cycle the norms set for themselves. Consider a student and dual-credit partner phase, since the sources note that student voices are usually missing; that phase needs its own access and privacy design.

### Responsibilities

The committee owns questions, coding, synthesis, and the draft. A named administrator maintains the roster. OTS confirms identity and infrastructure. A named BI owner maintains reports and refresh. Institutional reviewers confirm authority, applicable policy sections, public-records handling, and retention. Table facilitators act as champions for their table and recruit from under-heard groups.

Dates, the roster, the retention schedule, hosting region, licenses, and production identifiers are external prerequisites. Their absence blocks real data collection, not development.

## 11. Acceptance checks

- A member can submit a quick response on a phone in under five minutes and later expand it into a full proposal.
- A member can contribute to all six tables and resume a private draft.
- A concern or objection can be submitted without proposing any AI use, and appears in reports beside recommendations.
- No member can read another's private draft, change another's contribution, or raise their own role, including through direct API calls.
- Pulse answers cannot be tied to a name through the interface, exports, or the Power BI model.
- Collective and individual contributions stay distinguishable everywhere.
- Repeated and concurrent requests neither lose nor duplicate records.
- New question or proposal versions keep earlier answers and positions.
- Every submitted proposal can receive a disposition, and its author can see it.
- Every norm shows scope, strength, route, linked existing LSC rule, supporting contributions, reservations, and review date.
- The comment round records comments and positions per norm, and the response summary is published before the final draft.
- Each briefing panel shows its sources and the date they were checked; tool approvals are attributed to OTS.
- Power BI totals reconcile with the database, use labeled denominators, and suppress small groups.
- The interface passes keyboard, screen-reader, and mobile checks; PRIMER attribution appears on screen and in print.
- Legacy data is imported with original wording, timestamps, and provenance, and is not assigned to new questions.
- A full path from institutional sign-in to a refreshed report has been run on the deployed environment.

## 12. Scope

The first consultation is for North Harris employees. Students and dual-credit partners are affected groups discussed in the questions; giving them access is a later phase. The structure supports later consultations at other LSC colleges.

This document changes no code and creates no service, subscription, or deployment.
