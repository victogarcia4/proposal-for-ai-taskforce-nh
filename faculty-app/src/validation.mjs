import { MAX_TEXT, categories, divisions, yearsTeaching, opinionTypes, questions, survey } from "./content.mjs";

// Obvious personal identifiers that must not appear in free text.
const IDENTIFIER = /\b(A\d{8}|W\d{8}|\d{3}-\d{2}-\d{4})\b|[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

export function checkText(text) {
  if (typeof text !== "string") return "Text is required.";
  if (text.length > MAX_TEXT) return `Keep it to ${MAX_TEXT} characters.`;
  if (IDENTIFIER.test(text)) return "Remove emails, IDs or other identifying details.";
  return null;
}

export function validateProfile(p) {
  if (!categories.includes(p.category)) return "Choose your faculty category.";
  if (!divisions.includes(p.division)) return "Choose your division.";
  if (!yearsTeaching.includes(p.years)) return "Choose your years of teaching.";
  if (!p.privacy) return "Acknowledge the privacy notice to continue.";
  return null;
}

// Returns null when every required survey item is answered correctly.
export function validateSurvey(answers) {
  for (const item of survey) {
    const value = answers[item.id];
    const ids = new Set((item.options ?? []).map((o) => o.id));
    if (item.kind === "text") {
      if (value && checkText(value)) return `${item.id}: ${checkText(value)}`;
      continue;
    }
    if (item.kind === "single" && !ids.has(value)) return `Answer: ${item.text}`;
    if (item.kind === "multi" && (!Array.isArray(value) || !value.length || value.some((v) => !ids.has(v))))
      return `Choose at least one option: ${item.text}`;
    if (item.kind === "matrix" && item.rows.some((r) => !ids.has(value?.[r.id])))
      return `Complete every row: ${item.text}`;
  }
  return null;
}

export function validateAnswer(a) {
  const question = questions.find((x) => x.id === a.question_id);
  if (!question) return "Unknown question.";
  const ids = new Set(question.options.map((o) => o.id));
  const selected = a.selected ?? [];
  if (selected.some((s) => !ids.has(s))) return "Unknown option.";
  const other = (a.other_text ?? "").trim();
  if (selected.includes("other") && !other) return "Describe your “Other” answer.";
  if (!selected.length && !other) return "Choose at least one option.";
  if (other && checkText(other)) return checkText(other);
  if (!opinionTypes.some((o) => o.id === a.opinion_type)) return "Choose the type of opinion.";
  return null;
}
