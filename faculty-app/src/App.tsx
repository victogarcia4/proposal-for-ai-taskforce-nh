import { useEffect, useState } from "react";
import { coreQuestions, optionalQuestions, questions } from "./content.mjs";
import type { Answer, Profile, SurveyAnswers } from "./validation.mjs";
import { currentUser, DEMO, isAdmin, loadMine, signOut, type Mine } from "./data";
import { SignIn } from "./components/SignIn";
import { ProfileStep } from "./components/ProfileStep";
import { SurveyStep } from "./components/SurveyStep";
import { QuestionStep } from "./components/QuestionStep";
import { Admin } from "./components/Admin";
import { Intro } from "./components/Intro";
import { applyTheme, initialTheme, type Theme } from "./theme";

type Step =
  | { name: "loading" | "signin" | "profile" | "survey" | "more" | "done" | "admin" }
  | { name: "core" | "optional"; index: number };

export function App() {
  const [step, setStep] = useState<Step>({ name: "loading" });
  const [mine, setMine] = useState<Mine>({ profile: null, survey: null, answers: [] });
  const [error, setError] = useState("");
  // True when the participant opened an item from the review page; saving returns there.
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  async function route() {
    try {
      if (!(await currentUser())) return setStep({ name: "signin" });
      if (await isAdmin()) return setStep({ name: "admin" });
      const m = await loadMine();
      setMine(m);
      if (!m.profile) return setStep({ name: "profile" });
      if (m.survey?.status !== "Submitted") return setStep({ name: "survey" });
      // Returning participants resume at the first unanswered core question, or the review page.
      const next = coreQuestions.findIndex((q) => !m.answers.some((a) => a.question_id === q.id));
      setStep(next >= 0 ? { name: "core", index: next } : { name: "done" });
    } catch (e) {
      setError((e as Error).message);
      setStep({ name: "signin" });
    }
  }
  useEffect(() => { route(); }, []);

  const saved = (id: string) => mine.answers.find((a) => a.question_id === id);
  const remember = (a: Answer) =>
    setMine((m) => ({ ...m, answers: m.answers.filter((x) => x.question_id !== a.question_id).concat({ ...a, status: "Submitted" }) }));
  const edit = (next: Step) => { setEditing(true); setStep(next); };
  const after = (next: Step) => { setStep(editing ? { name: "done" } : next); setEditing(false); };

  let body;
  switch (step.name) {
    case "loading": body = <p className="card">Loading…</p>; break;
    case "signin": body = <><Intro /><SignIn onDone={route} /></>; break;
    case "admin": body = <Admin />; break;
    case "profile":
      body = (
        <ProfileStep
          initial={mine.profile ? { ...mine.profile, privacy: true } : {}}
          onDone={(p: Profile) => {
            setMine((m) => ({ ...m, profile: { category: p.category, division: p.division, years: p.years, privacy_version: "" } }));
            after({ name: "survey" });
          }}
        />
      );
      break;
    case "survey":
      body = (
        <SurveyStep
          initial={mine.survey?.answers ?? {}}
          submitted={mine.survey?.status === "Submitted"}
          onSaved={(answers: SurveyAnswers, status) => setMine((m) => ({ ...m, survey: { answers, status } }))}
          onDone={() => after({ name: "core", index: 0 })}
        />
      );
      break;
    case "core":
    case "optional": {
      const list = step.name === "core" ? coreQuestions : optionalQuestions;
      body = (
        <QuestionStep
          list={list}
          index={step.index}
          label={step.name === "core" ? "Part B" : "Optional"}
          saved={saved(list[step.index].id)}
          onSaved={remember}
          editing={editing}
          onBack={() => editing ? after({ name: "done" }) : setStep(step.index ? { ...step, index: step.index - 1 } : step.name === "core" ? { name: "survey" } : { name: "more" })}
          onNext={() => after(step.index + 1 < list.length ? { ...step, index: step.index + 1 } : step.name === "core" ? { name: "more" } : { name: "done" })}
        />
      );
      break;
    }
    case "more":
      body = (
        <section className="card">
          <h2>Thank you. Your core answers are saved.</h2>
          <p>Would you like to answer {optionalQuestions.length} optional questions? About 4 more minutes.</p>
          <div className="row">
            <button className="ghost" onClick={() => setStep({ name: "done" })}>No, I'm done</button>
            <button onClick={() => setStep({ name: "optional", index: 0 })}>Yes, continue</button>
          </div>
        </section>
      );
      break;
    case "done":
      body = (
        <section className="card">
          <h2>All set. Thank you!</h2>
          <p>
            Your answers are saved. You can come back any time while the consultation is open: sign in again with the
            same email and choose any item below to review or change it.
          </p>
          <ul className="review">
            <li><button className="link" onClick={() => edit({ name: "profile" })}>✓ About you</button></li>
            <li><button className="link" onClick={() => edit({ name: "survey" })}>{mine.survey?.status === "Submitted" ? "✓" : "○"} Part A · How you use AI</button></li>
            {questions.map((q) => {
              const list = q.tier === "core" ? coreQuestions : optionalQuestions;
              const answered = !!saved(q.id);
              return (
                <li key={q.id}>
                  <button className="link" onClick={() => edit({ name: q.tier, index: list.indexOf(q) })}>
                    {answered ? "✓" : "○"} {q.id} · {q.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      );
      break;
  }

  return (
    <>
      <header>
        <img src="/logo.png" alt="Lone Star College North Harris" />
        <div>
          <h1>Faculty AI Consultation</h1>
          <p>North Harris AI Task Force · faculty voices on AI use</p>
        </div>
        <div className="header-actions">
          <button className="ghost theme-toggle" onClick={toggleTheme} aria-pressed={theme === "dark"}>
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
          {step.name !== "signin" && step.name !== "loading" && (
            <button className="ghost" onClick={async () => { await signOut(); setStep({ name: "signin" }); }}>Sign out</button>
          )}
        </div>
      </header>
      {DEMO && <p className="banner">Demo mode · fictitious data · nothing is saved</p>}
      <main>
        {error && <p className="error card">{error}</p>}
        {body}
      </main>
      <footer>Human-led consultation · Do not enter student records, grades, IDs or identifying details.</footer>
    </>
  );
}
