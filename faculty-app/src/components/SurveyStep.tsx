import { useState } from "react";
import { survey } from "../content.mjs";
import { validateSurvey, type SurveyAnswers } from "../validation.mjs";
import { saveSurvey } from "../data";
import { Choice, LimitedText } from "./Fields";

export function SurveyStep({ initial, onDone }: { initial: SurveyAnswers; onDone: () => void }) {
  const [a, setA] = useState<SurveyAnswers>(initial);
  const [error, setError] = useState("");
  const set = (id: string, v: SurveyAnswers[string]) => setA({ ...a, [id]: v });

  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = validateSurvey(a);
        if (problem) return setError(problem);
        try {
          await saveSurvey(a, "Submitted");
          onDone();
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <h2>Part A · How you use AI</h2>
      <p className="muted">About 4 minutes.</p>
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
        <button type="button" className="ghost" onClick={() => saveSurvey(a, "Draft").catch((e) => setError(e.message))}>Save draft</button>
        <button>Continue to Part B</button>
      </div>
    </form>
  );
}
