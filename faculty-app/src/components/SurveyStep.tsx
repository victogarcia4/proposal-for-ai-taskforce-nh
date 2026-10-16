import { useEffect, useRef, useState } from "react";
import { survey } from "../content.mjs";
import { validateSurvey, type SurveyAnswers } from "../validation.mjs";
import { saveSurvey, type Status } from "../data";
import { Choice, LimitedText } from "./Fields";

export function SurveyStep({ initial, submitted, onSaved, onDone }: {
  initial: SurveyAnswers;
  submitted: boolean;
  onSaved: (a: SurveyAnswers, status: Status) => void;
  onDone: () => void;
}) {
  const [a, setA] = useState<SurveyAnswers>(initial);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const dirty = useRef(false);
  const set = (id: string, v: SurveyAnswers[string]) => {
    dirty.current = true;
    setA({ ...a, [id]: v });
  };

  async function save(answers: SurveyAnswers, status: Status) {
    await saveSurvey(answers, status);
    onSaved(answers, status);
    dirty.current = false;
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  // Autosave progress so a participant who leaves mid-survey finds it on return.
  // A submitted survey stays submitted while it is still complete.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      const status: Status = submitted && !validateSurvey(a) ? "Submitted" : "Draft";
      save(a, status).catch((e) => setError(e.message));
    }, 1500);
    return () => clearTimeout(t);
  }, [a]);

  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = validateSurvey(a);
        if (problem) return setError(problem);
        try {
          await save(a, "Submitted");
          onDone();
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <h2>Part A · How you use AI</h2>
      <p className="muted">About 4 minutes. Your progress is saved automatically.</p>
      {survey.map((item, i) => (
        <fieldset key={item.id} className="item">
          <legend><b>{i + 1}.</b> {item.text}</legend>
          {item.kind === "single" && (
            <Choice name={item.id} options={item.options!} value={a[item.id] as string} onChange={(v) => set(item.id, v)} />
          )}
          {item.kind === "multi" && (
            <Choice multi name={item.id} options={item.options!} value={a[item.id] as string[]} onChange={(v) => set(item.id, v)} />
          )}
          {item.kind === "matrix" && (
            <div className="matrix">
              {item.rows!.map((row) => {
                const value = (a[item.id] as Record<string, string> | undefined) ?? {};
                return (
                  <label key={row.id} className="matrix-row">
                    <span>{row.label}</span>
                    <select value={value[row.id] ?? ""} onChange={(e) => set(item.id, { ...value, [row.id]: e.target.value })}>
                      <option value="">Choose…</option>
                      {item.options!.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </label>
                );
              })}
            </div>
          )}
          {item.kind === "text" && (
            <LimitedText label="Your comment" value={(a[item.id] as string) ?? ""} onChange={(v) => set(item.id, v)} />
          )}
        </fieldset>
      ))}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row end">
        {savedAt && <span className="muted saved">Saved {savedAt}</span>}
        <button>{submitted ? "Save changes" : "Continue to Part B"}</button>
      </div>
    </form>
  );
}
