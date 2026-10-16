import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { coreQuestions, optionalQuestions, questions, survey, opinionTypes, divisions } from "../src/content.mjs";
import { validateAnswer, validateProfile, validateSurvey, checkText } from "../src/validation.mjs";
import { summarize, toCsv } from "../src/report.mjs";

const sql = readFileSync(new URL("../supabase/migrations/20261016120000_faculty_app.sql", import.meta.url), "utf8");

test("10 core and 4 optional questions, each with Other and at most 6 prefilled options", () => {
  assert.equal(coreQuestions.length, 10);
  assert.equal(optionalQuestions.length, 4);
  for (const q of questions) {
    assert.equal(q.options.at(-1).id, "other");
    assert.ok(q.options.length - 1 <= 6, q.id);
    assert.equal(new Set(q.options.map((o) => o.id)).size, q.options.length, q.id);
  }
});

test("migration accepts exactly the app's question ids and opinion types", () => {
  for (const q of questions) assert.ok(sql.includes(`'${q.id}'`), q.id);
  for (const o of opinionTypes) assert.ok(sql.includes(`'${o.id}'`), o.id);
  assert.match(sql, /char_length\(other_text\) <= 600/);
  assert.doesNotMatch(sql, /\b(drop|truncate|delete from)\b/i, "migration must be additive");
  for (const d of divisions) assert.ok(d.length <= 80);
});

test("answers need an option or text, a valid opinion type, and at most 600 characters", () => {
  const ok = { question_id: "T1Q2", selected: ["grammar"], other_text: "", opinion_type: "advice" };
  assert.equal(validateAnswer(ok), null);
  assert.match(validateAnswer({ ...ok, selected: [] }), /at least one/);
  assert.equal(validateAnswer({ ...ok, selected: [], other_text: "My own view" }), null);
  assert.match(validateAnswer({ ...ok, selected: ["other"] }), /Other/);
  assert.match(validateAnswer({ ...ok, opinion_type: "" }), /type of opinion/);
  assert.match(validateAnswer({ ...ok, other_text: "x".repeat(601) }), /600/);
  assert.match(validateAnswer({ ...ok, selected: ["made_up"] }), /Unknown option/);
  assert.match(checkText("email me at someone@lonestar.edu"), /identifying/);
});

test("profile is faculty only", () => {
  const p = { category: "Adjunct faculty", division: "Mathematics", years: "4-10", privacy: true };
  assert.equal(validateProfile(p), null);
  assert.ok(validateProfile({ ...p, category: "Staff" }));
  assert.ok(validateProfile({ ...p, privacy: false }));
});

function fullSurvey() {
  return Object.fromEntries(survey.filter((i) => i.kind !== "text").map((i) => [i.id,
    i.kind === "single" ? i.options[0].id : i.kind === "multi" ? [i.options[0].id] : Object.fromEntries(i.rows.map((r) => [r.id, i.options[0].id]))]));
}

test("survey requires every non-optional item", () => {
  const a = fullSurvey();
  assert.equal(validateSurvey(a), null);
  assert.ok(validateSurvey({ ...a, S1: undefined }));
  assert.ok(validateSurvey({ ...a, S3: { lectures: "chatgpt" } }));
  assert.ok(validateSurvey({ ...a, S11: "y".repeat(601) }));
});

test("summary counts and CSV export are anonymous and formula-safe", () => {
  const all = {
    profiles: [{ user_id: "u1", category: "Adjunct faculty", division: "Mathematics", years: "0-3" }],
    surveys: [{ user_id: "u1", answers: { ...fullSurvey(), S11: "=HYPERLINK(1)" }, status: "Submitted" }],
    answers: [{ user_id: "u1", question_id: "T1Q2", selected: ["grammar", "other"], other_text: "Depends", opinion_type: "claim", status: "Submitted" }],
  };
  const s = summarize(all);
  assert.equal(s.participants, 1);
  const t1q2 = s.questionSummary.find((x) => x.question.id === "T1Q2");
  assert.equal(t1q2.counts.grammar, 1);
  assert.equal(t1q2.types.claim, 1);
  const csv = toCsv(all);
  assert.ok(!csv.includes("u1"));
  assert.ok(csv.includes("P001"));
  assert.ok(csv.includes("'=HYPERLINK(1)"));
});
