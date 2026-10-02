import type { Command, Feed, Profile, Proposal } from "./consultation.ts";
import { validateCommand } from "./validation.mjs";
export const demoProfiles: Profile[] = [
  {
    id: "demo-participant",
    name: "Morgan Ellis",
    category: "Adjunct faculty",
    unit: "Arts & Humanities",
    discipline: "English",
    years: "1–5 years",
    roles: ["Participant"],
  },
  {
    id: "demo-facilitator",
    name: "Jordan Chen",
    category: "Staff",
    unit: "Student Services",
    discipline: "Not a teaching role",
    years: "6–10 years",
    roles: ["Participant", "Facilitator"],
  },
  {
    id: "demo-committee",
    name: "Avery Brooks",
    category: "Full-time faculty",
    unit: "Health Sciences",
    discipline: "Health professions",
    years: "6–10 years",
    roles: ["Participant", "Committee"],
  },
  {
    id: "demo-admin",
    name: "Riley Patel",
    category: "Administrator",
    unit: "Academic Affairs",
    discipline: "Education",
    years: "11+ years",
    roles: ["Participant", "Administrator"],
  },
];
const requests = new Set<string>();
const pulseReceipts = new Set<string>();
const anonymousPulse: { stage: string; answers: Record<string, string> }[] = [];
const invitations = new Set<string>();
export function initialDemo(): Feed {
  const proposal: Proposal = {
    id: "demo-proposal-1",
    author_id: "demo-participant",
    question_id: "T5Q4",
    revision: 1,
    status: "Submitted",
    content: {
      depth: "Quick response",
      type: "Concern or objection",
      statement:
        "Offer paid, short training sessions for adjuncts outside the standard workday. Unpaid training makes it harder for part-time faculty to participate.",
      scope: "Campus-wide baseline",
      visibility: "Members",
    },
    created_at: "2026-10-02T16:00:00Z",
    codes: ["theme-equity"],
    history: [],
  };
  return {
    profile: demoProfiles[0],
    profiles: structuredClone(demoProfiles),
    proposals: [proposal],
    norms: [],
    comments: [],
    rounds: [
      {
        id: "demo-round-1",
        name: "Development listening round",
        phase: "Collect",
        open: true,
      },
    ],
    syntheses: [],
    actions: [],
    codeCatalog: [
      { id: "theme-equity", dimension: "Theme", label: "Equity and access" },
      {
        id: "theme-learning",
        dimension: "Theme",
        label: "Learning and assessment",
      },
      { id: "risk-privacy", dimension: "Risk", label: "Data exposure" },
      {
        id: "risk-workload",
        dimension: "Risk",
        label: "Workload and job security",
      },
      { id: "scope-campus", dimension: "Scope", label: "Campus-wide baseline" },
      {
        id: "action-ots",
        dimension: "Suggested action",
        label: "Refer to OTS",
      },
      {
        id: "action-training",
        dimension: "Suggested action",
        label: "Professional development",
      },
    ],
    sessions: [],
    pulse: {
      Baseline: { suppressed: true, threshold: 5 },
      Closing: { suppressed: true, threshold: 5 },
    },
    rosterCount: null,
    threshold: 5,
    draft: { version: 1, status: "Working", response_summary: "" },
    notifications: [],
  };
}
export function demoWrite(feed: Feed, cmd: Command, actor: Profile): Feed {
  const next = structuredClone(feed),
    now = new Date().toISOString();
  const data = cmd as any;
  if (requests.has(cmd.request_id)) return next;
  validateCommand(cmd);
  const editor = actor.roles.some((r) =>
    ["Committee", "Administrator"].includes(r),
  );
  const admin = actor.roles.includes("Administrator");
  if (
    [
      "disposition",
      "coding",
      "code",
      "moderate",
      "practice",
      "synthesis",
      "norm",
      "draft",
      "action",
    ].includes(cmd.action) &&
    !editor
  )
    throw new Error("Committee role required.");
  if (["round", "roster", "role", "membership"].includes(cmd.action) && !admin)
    throw new Error("Administrator role required.");
  const collect = next.rounds.some((r) => r.open && r.phase === "Collect");
  if (cmd.action === "proposal") {
    if (!collect) throw new Error("The contribution round is closed.");
    if (
      data.content.collective === "true" &&
      !actor.roles.some((r) =>
        ["Facilitator", "Committee", "Administrator"].includes(r),
      )
    )
      throw new Error("Facilitator role required.");
    const original = next.proposals.find((p) => p.id === data.id);
    if (
      original &&
      (original.author_id !== actor.id || original.revision !== data.revision)
    )
      throw new Error("Conflict: reload the current revision.");
    const id = original?.id || crypto.randomUUID(),
      revision = (original?.revision || 0) + 1;
    const proposal = {
      id,
      author_id: actor.id,
      question_id: data.question_id,
      revision,
      status: data.status,
      content: data.content,
      created_at: original?.created_at || now,
      history: [
        ...(original?.history || []),
        { revision, content: data.content, created_at: now },
      ],
    };
    next.proposals = next.proposals.filter((p) => p.id !== id).concat(proposal);
  } else if (cmd.action === "profile") {
    next.profiles = next.profiles.map((p) =>
      p.id === actor.id
        ? {
            ...p,
            name: data.name,
            category: data.category,
            unit: data.unit,
            discipline: data.discipline,
            years: data.years,
          }
        : p,
    );
    next.profile = next.profiles.find((p) => p.id === actor.id)!;
  } else if (cmd.action === "comment" || cmd.action === "position") {
    if (
      !next.rounds.some(
        (r) => r.open && (data.kind === "proposal" || r.phase === "Comment"),
      )
    )
      throw new Error("The discussion round is closed.");
    const target =
      data.kind === "proposal"
        ? next.proposals.find(
            (p) => p.id === data.target_id && p.status === "Submitted",
          )
        : next.norms.find(
            (n) => n.id === data.target_id && n.status === "Published",
          );
    if (!target || target.revision !== data.revision)
      throw new Error("The target revision changed.");
    if (cmd.action === "position")
      next.comments = next.comments.filter(
        (c) =>
          !(
            c.author_id === actor.id &&
            c.target_id === data.target_id &&
            c.revision === data.revision &&
            c.position
          ),
      );
    next.comments.push({
      id: crypto.randomUUID(),
      author_id: actor.id,
      target_id: data.target_id,
      revision: data.revision,
      body: data.body,
      position: cmd.action === "position" ? data.position : undefined,
      kind: data.kind,
      created_at: now,
    });
  } else if (
    ["disposition", "coding", "moderate", "practice"].includes(cmd.action)
  ) {
    const p = next.proposals.find((p) => p.id === data.id);
    if (!p || p.status === "Draft" || p.revision !== data.revision)
      throw new Error("Contribution changed.");
    if (cmd.action === "disposition") {
      p.disposition = { outcome: data.outcome, reason: data.reason };
      next.notifications.push({
        id: crypto.randomUUID(),
        message: `${p.disposition.outcome}: ${p.disposition.reason}`,
        created_at: now,
      });
    }
    if (cmd.action === "coding") {
      p.codes = data.codes;
      p.linked_ids = data.linked_ids;
    }
    if (cmd.action === "moderate") p.status = "Moderated";
    if (cmd.action === "practice") p.practice_approved = data.approved;
  } else if (cmd.action === "synthesis")
    next.syntheses = next.syntheses
      .filter((s) => s.question_id !== data.question_id)
      .concat(data);
  else if (cmd.action === "action") {
    if (data.id)
      next.actions = next.actions.map((a) =>
        a.id === data.id
          ? {
              ...a,
              text: data.text,
              owner: data.owner,
              due: data.due,
              status: data.status,
            }
          : a,
      );
    else
      next.actions.push({
        id: crypto.randomUUID(),
        text: data.text,
        owner: data.owner,
        due: data.due,
        status: data.status,
      });
  } else if (cmd.action === "code") {
    next.codeCatalog = next.codeCatalog
      .filter((c) => c.id !== data.id)
      .concat({ id: data.id, dimension: data.dimension, label: data.label });
  } else if (cmd.action === "session")
    next.sessions.push({
      id: crypto.randomUUID(),
      name: data.name,
      date: data.date,
    });
  else if (cmd.action === "norm") {
    const original = next.norms.find((n) => n.id === data.id);
    if (original && original.revision !== data.revision)
      throw new Error("Norm changed.");
    const norm = {
      id: original?.id || crypto.randomUUID(),
      revision: (original?.revision || 0) + 1,
      status: "Working",
      content: data.content,
      contribution_ids: data.contribution_ids,
      source_ids: data.source_ids,
      contribution_versions: Object.fromEntries(
        data.contribution_ids.map((id: string) => {
          const p = next.proposals.find((p) => p.id === id)!;
          return [id, { revision: p.revision, statement: p.content.statement }];
        }),
      ),
      history: [
        ...(original?.history || []),
        { content: data.content, created_at: now },
      ],
    };
    next.norms = next.norms.filter((n) => n.id !== norm.id).concat(norm);
  } else if (cmd.action === "draft") {
    if (!next.norms.length)
      throw new Error("Create at least one norm before publishing.");
    if (
      data.status === "Final" &&
      (!next.draft.response_summary.trim() || next.rounds.some((r) => r.open))
    )
      throw new Error(
        "Publish the response summary and close the comment round before finalizing.",
      );
    next.draft = {
      version: next.draft.version + 1,
      status: data.status,
      response_summary: data.response_summary,
    };
    next.norms.forEach((n) => (n.status = data.status));
  } else if (cmd.action === "round") {
    next.rounds.forEach((r) => (r.open = false));
    next.rounds.unshift({
      id: crypto.randomUUID(),
      name: data.name,
      phase: data.phase,
      open: data.open,
    });
  } else if (cmd.action === "role") {
    const p = next.profiles.find((p) => p.id === data.user_id);
    if (p) {
      if (data.operation === "Revoke") {
        if (p.id === actor.id && data.role === "Administrator")
          throw new Error("You cannot revoke your own administrator role.");
        p.roles = p.roles.filter((r) => r !== data.role);
      } else if (!p.roles.includes(data.role)) p.roles.push(data.role);
    }
  } else if (cmd.action === "roster") {
    invitations.add(data.email.toLowerCase());
    next.rosterCount = invitations.size;
  } else if (cmd.action === "pulse") {
    const round = next.rounds.find((r) => r.open);
    if (!round) throw new Error("Pulse round is closed.");
    const receipt = `${actor.id}:${round.id}:${data.stage}`;
    if (pulseReceipts.has(receipt))
      throw new Error(
        "You already submitted this pulse for the current round.",
      );
    pulseReceipts.add(receipt);
    anonymousPulse.push({ stage: data.stage, answers: data.answers });
    next.pulse[data.stage] = { suppressed: true, threshold: next.threshold };
  }
  requests.add(cmd.request_id);
  return next;
}
export function visibleDemo(feed: Feed, actorId: string): Feed {
  const profile = feed.profiles.find((p) => p.id === actorId)!;
  const editor = profile.roles.some((r) =>
    ["Committee", "Administrator"].includes(r),
  );
  return {
    ...feed,
    profile,
    proposals: feed.proposals.filter(
      (p) =>
        p.author_id === actorId ||
        p.status === "Submitted" ||
        (editor && p.status === "Moderated"),
    ),
    norms: feed.norms.filter((n) => editor || n.status !== "Working"),
  };
}
