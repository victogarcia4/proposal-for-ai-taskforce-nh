import { readQuestionBank } from "./consultation-content.mjs";
import { sources, briefings } from "../src/lib/content.ts";
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
export function seedSql() {
  const tables = readQuestionBank();
  const queries = ["begin;"];
  for (const t of tables) {
    queries.push(
      `insert into public.nh_tables values(${[t.id, t.title, t.deliverable, t.probes].map(quote).join(",")});`,
    );
    for (const q of t.questions) {
      queries.push(
        `insert into public.nh_questions values(${quote(q.id)},${quote(t.id)});`,
      );
      queries.push(
        `insert into public.nh_question_versions values(${quote(q.id)},2,${quote(q.text)});`,
      );
    }
    const b = briefings[Number(t.id[1]) - 1];
    queries.push(
      `insert into public.nh_briefings values(${quote(t.id)},${quote(b[0])},${quote(b[1])},array[${b[2].map(quote).join(",")}],null);`,
    );
  }
  for (const s of sources)
    queries.push(
      `insert into public.nh_sources values(${[s.id, s.title, s.url, s.kind].map(quote).join(",")},${s.id === "ots-tools" ? "'2026-10-02'" : "null"});`,
    );
  for (const [id, dimension, label] of [
    ["theme-equity", "Theme", "Equity and access"],
    ["theme-learning", "Theme", "Learning and assessment"],
    ["risk-privacy", "Risk", "Data exposure"],
    ["risk-workload", "Risk", "Workload and job security"],
    ["scope-campus", "Scope", "Campus-wide baseline"],
    ["action-ots", "Suggested action", "Refer to OTS"],
    ["action-training", "Suggested action", "Professional development"],
  ])
    queries.push(
      `insert into public.nh_codes values(${[id, dimension, label].map(quote).join(",")});`,
    );
  queries.push("commit;");
  return queries.join("\n");
}
if (process.argv[1]?.endsWith("seed-sql.mjs")) console.log(seedSql());
