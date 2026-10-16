import { opinionTypes, questions, survey } from "./content.mjs";

// Counts per option for every survey item and question, for the administrator view.
export function summarize(all) {
  const count = (values, ids) => {
    const c = Object.fromEntries(ids.map((id) => [id, 0]));
    for (const v of values) if (v in c) c[v]++;
    return c;
  };
  const surveys = all.surveys.filter((s) => s.status === "Submitted");
  const surveySummary = survey.filter((i) => i.kind !== "text").map((item) => {
    const ids = item.options.map((o) => o.id);
    if (item.kind === "matrix")
      return { item, n: surveys.length, rows: item.rows.map((r) => ({ row: r, counts: count(surveys.map((s) => s.answers[item.id]?.[r.id]), ids) })) };
    const values = surveys.flatMap((s) => [].concat(s.answers[item.id] ?? []));
    return { item, n: surveys.length, counts: count(values, ids) };
  });
  const questionSummary = questions.map((q) => {
    const rows = all.answers.filter((a) => a.question_id === q.id && a.status === "Submitted");
    return {
      question: q,
      n: rows.length,
      counts: count(rows.flatMap((r) => r.selected), q.options.map((o) => o.id)),
      types: count(rows.map((r) => r.opinion_type), opinionTypes.map((o) => o.id)),
      texts: rows.filter((r) => r.other_text).map((r) => ({ text: r.other_text, type: r.opinion_type })),
    };
  });
  return { participants: all.profiles.length, surveySummary, questionSummary };
}

const cell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // prevent spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

// One row per answer, with an anonymous participant number instead of the account id.
export function toCsv(all) {
  const ids = new Map(all.profiles.map((p, i) => [p.user_id, `P${String(i + 1).padStart(3, "0")}`]));
  const profile = new Map(all.profiles.map((p) => [p.user_id, p]));
  const lines = [["participant", "category", "division", "years", "part", "item", "row", "value", "opinion_type", "text"]];
  const base = (uid) => { const p = profile.get(uid) ?? {}; return [ids.get(uid) ?? "?", p.category, p.division, p.years]; };
  for (const s of all.surveys)
    for (const item of survey) {
      const v = s.answers[item.id];
      if (v == null) continue;
      if (item.kind === "matrix") for (const [row, val] of Object.entries(v)) lines.push([...base(s.user_id), "A", item.id, row, val, "", ""]);
      else if (item.kind === "text") lines.push([...base(s.user_id), "A", item.id, "", "", "", v]);
      else for (const val of [].concat(v)) lines.push([...base(s.user_id), "A", item.id, "", val, "", ""]);
    }
  for (const a of all.answers)
    lines.push([...base(a.user_id), "B", a.question_id, "", a.selected.join("|"), a.opinion_type, a.other_text]);
  return "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
}
