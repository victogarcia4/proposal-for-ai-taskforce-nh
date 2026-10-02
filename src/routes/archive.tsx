import { createFileRoute } from "@tanstack/react-router";
import legacySource from "../../legacy/app.js?raw";

export const Route = createFileRoute("/archive")({ component: Archive });
function Archive() {
  const groups = [
    ...legacySource.matchAll(
      /number: '(\d+)', short: '[^']+', title: '([^']+)'[\s\S]*?prompts: \[([\s\S]*?)\]/g,
    ),
  ].map((m) => ({
    number: m[1],
    title: m[2],
    questions: [...m[3].matchAll(/'([^']*(?:student's)[^']*|[^']+)'/g)].map(
      (q) => q[1],
    ),
  }));
  return (
    <main className="nh-main nh-archive">
      <a href="/">← Return to the consultation</a>
      <h1>Original working-session archive</h1>
      <p>
        The original three tables and eleven prompts are preserved here. They
        retain their original wording; the new consultation uses a separate
        six-table question bank.
      </p>
      {groups.map((g) => (
        <section key={g.number}>
          <h2>{g.title}</h2>
          <ol>
            {g.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </section>
      ))}
      <p>PRIMER framework author: Kayla Almaguer</p>
      <p>
        Historical contributions require a reviewed archive import. Their
        original authors are unverified and must not be reassigned to the new
        questions.
      </p>
    </main>
  );
}
