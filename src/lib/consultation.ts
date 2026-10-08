const projectUrl = import.meta.env.VITE_SUPABASE_URL;
if (!projectUrl)
  throw new Error("Configure VITE_SUPABASE_URL before loading the app.");
export const PROJECT_URL = projectUrl;
export const CONSULTATION_ID = "north-harris-ai-norms";
export const categories = [
  "Full-time faculty",
  "Adjunct faculty",
  "Staff",
  "Administrator",
];
export const disciplines = [
  "English",
  "Mathematics",
  "Natural sciences",
  "Social sciences",
  "Humanities",
  "Business",
  "Communications",
  "Computer science",
  "Engineering",
  "Health professions",
  "Education",
  "Fine arts",
  "Other teaching discipline",
  "Not a teaching role",
];
export const contributionTypes = [
  "Recommendation",
  "Concern or objection",
  "Practice to share",
  "Question for OTS or administration",
  "Information gap",
  "Not applicable to my role",
  "I do not have enough information",
];
export const scopes = [
  "Campus-wide baseline",
  "Division or department",
  "Course or unit discretion",
];
export const strengths = [
  "Required",
  "Expected",
  "Recommended",
  "Not permitted",
];
export const routes = [
  "Adopt at North Harris",
  "Refer to OTS",
  "Refer to the system policy process",
  "Professional development request",
  "Already covered by an existing LSC rule",
];
export const positions = ["Support", "Support with changes", "Disagree"];
export const dispositions = [
  "Incorporated",
  "Incorporated with changes",
  "Referred to OTS",
  "Referred to the system policy process",
  "Referred to professional development",
  "Deferred",
  "Not adopted",
];
export const primer = [
  [
    "P",
    "Process-Oriented",
    "Grade the path, not just the final output. Drafts, decisions, revisions, and dead ends are part of the evidence.",
  ],
  [
    "R",
    "Reflective",
    "Build in a moment to think about how the work happened. Name what changed and the judgment behind each choice.",
  ],
  [
    "I",
    "Interactive",
    "Require real exchange with another person. Make feedback consequential.",
  ],
  [
    "M",
    "Multi-Modal",
    "Let understanding take more than one form: written, spoken, visual, or hands-on.",
  ],
  [
    "E",
    "Engaging",
    "Connect to genuine curiosity or motivation. Start with a meaningful problem and give people a real choice.",
  ],
  [
    "R",
    "Relevant",
    "Tie the work to real stakes. Name the audience and what changes if a decision is wrong.",
  ],
];
export type Profile = {
  id: string;
  name: string;
  // Returned only for the signed-in member. It is never included in the
  // membership directory or contribution display.
  institutional_email?: string;
  category: string;
  unit: string;
  discipline: string;
  years: string;
  roles: string[];
};
export type Proposal = {
  id: string;
  author_id: string;
  question_id: string;
  revision: number;
  status: string;
  content: Record<string, string>;
  created_at: string;
  disposition?: { outcome: string; reason: string };
  codes?: string[];
  linked_ids?: string[];
  practice_approved?: boolean;
  history?: {
    revision: number;
    content: Record<string, string>;
    created_at: string;
  }[];
};
export type Norm = {
  id: string;
  revision: number;
  status: string;
  content: Record<string, string>;
  contribution_ids: string[];
  source_ids: string[];
  contribution_versions?: Record<
    string,
    { revision: number; statement: string }
  >;
  history?: unknown[];
};
export type Comment = {
  id: string;
  author_id: string;
  target_id: string;
  revision: number;
  body: string;
  position?: string;
  kind: string;
  created_at: string;
};
export type Attachment = {
  id: string;
  contribution_id: string;
  name: string;
  description: string;
  bytes: number;
};
export type Feed = {
  profile: Profile | null;
  profiles: Profile[];
  proposals: Proposal[];
  norms: Norm[];
  comments: Comment[];
  rounds: { id: string; name: string; phase: string; open: boolean }[];
  syntheses: {
    question_id: string;
    agreement: string;
    reservations: string;
    minority: string;
    gaps: string;
  }[];
  actions: {
    id: string;
    text: string;
    owner: string;
    due: string;
    status: string;
  }[];
  codeCatalog: { id: string; dimension: string; label: string }[];
  sessions: { id: string; name: string; date: string }[];
  pulse: Record<string, unknown>;
  rosterCount: number | null;
  threshold: number;
  participationByCategory?: Record<string, number | null>;
  draft: { version: number; status: string; response_summary: string };
  notifications: { id: string; message: string; created_at: string }[];
};
export type Command = {
  action: string;
  request_id: string;
  [key: string]: unknown;
};
export function command(
  action: string,
  data: Record<string, unknown> = {},
): Command {
  return { action, request_id: crypto.randomUUID(), ...data };
}
export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export function csv(rows: Record<string, unknown>[]) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value: unknown) => {
    let text =
      typeof value === "object"
        ? JSON.stringify(value ?? "")
        : String(value ?? "");
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [
    keys.map(escape).join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ].join("\r\n");
}
