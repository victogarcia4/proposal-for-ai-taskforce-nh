import { categories, divisions, opinionTypes, questions, survey, yearsTeaching } from "./content.mjs";
import type { AllData } from "./data";

// Deterministic fictitious responses for the demo administrator view.
export function demoAll(): AllData {
  let seed = 7;
  const rnd = (n: number) => ((seed = (seed * 9301 + 49297) % 233280) / 233280) * n | 0;
  const pick = <T,>(xs: T[]) => xs[rnd(xs.length)];
  const data: AllData = { profiles: [], surveys: [], answers: [] };
  for (let i = 0; i < 24; i++) {
    const user_id = `demo-${i}`;
    data.profiles.push({ user_id, category: pick(categories), division: pick(divisions), years: pick(yearsTeaching) });
    const answers: Record<string, unknown> = {};
    for (const item of survey) {
      const ids = (item.options ?? []).map((o) => o.id);
      if (item.kind === "single") answers[item.id] = pick(ids);
      if (item.kind === "multi") answers[item.id] = [...new Set([pick(ids), pick(ids)])];
      if (item.kind === "matrix") answers[item.id] = Object.fromEntries(item.rows!.map((r) => [r.id, pick(ids)]));
    }
    data.surveys.push({ user_id, answers: answers as never, status: "Submitted" });
    for (const q of questions) {
      if (q.tier === "optional" && rnd(3)) continue;
      const ids = q.options.map((o) => o.id).filter((id) => id !== "other");
      data.answers.push({
        user_id, question_id: q.id, selected: [...new Set([pick(ids), pick(ids)])],
        other_text: rnd(5) ? "" : "Fictitious example comment for the demo.",
        opinion_type: pick(opinionTypes).id, status: "Submitted",
      });
    }
  }
  return data;
}
