import { readFileSync } from "node:fs";

// Read the approved plan without rewriting the source document.
export function readQuestionBank() {
  const plan = readFileSync(
    new URL("../AI_Policy_Application_Plan_v2.md", import.meta.url),
    "utf8",
  );
  const section = plan
    .split("## 5. Working tables")[1]
    .split("## 6. Application behavior")[0];
  return [
    ...section.matchAll(
      /### Table (\d) ([^\r\n]+)\r?\n([\s\S]*?)(?=### Table|No session)/g,
    ),
  ].map((match) => ({
    id: `T${match[1]}`,
    title: match[2],
    deliverable: match[3].match(/Deliverable: ([^\r\n]+)/)?.[1] ?? "",
    probes: match[3].match(/Probes: ([^\r\n]+)/)?.[1] ?? "",
    questions: [
      ...match[3].matchAll(/\d\. (T\dQ\d)(?: \*\(revised\)\*)?: ([^\r\n]+)/g),
    ].map((q) => ({ id: q[1], text: q[2], version: 2 })),
  }));
}
