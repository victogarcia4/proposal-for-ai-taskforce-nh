import { useEffect, useState } from "react";
import { opinionTypes, type Question } from "../content.mjs";
import { validateAnswer, type Answer } from "../validation.mjs";
import { saveAnswer } from "../data";
import { Choice, LimitedText } from "./Fields";

const blank = (question_id: string): Answer => ({ question_id, selected: [], other_text: "", opinion_type: "" });

export function QuestionStep({ list, index, label, saved, onSaved, onBack, onNext }: {
  list: Question[];
  index: number;
  label: string;
  saved: Answer | undefined;
  onSaved: (a: Answer) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const q = list[index];
  const [a, setA] = useState<Answer>(saved ?? blank(q.id));
  const [more, setMore] = useState(!!saved?.other_text && !saved.selected.includes("other"));
  const [error, setError] = useState("");
  useEffect(() => {
    setA(saved ?? blank(q.id));
    setMore(!!saved?.other_text && !saved.selected.includes("other"));
    setError("");
  }, [q.id]);

  const showText = a.selected.includes("other") || more;
  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        const answer = showText ? a : { ...a, other_text: "" };
        const problem = validateAnswer(answer);
        if (problem) return setError(problem);
        try {
          await saveAnswer(answer, "Submitted");
          onSaved(answer);
          onNext();
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <div className="progress" aria-label={`${label} ${index + 1} of ${list.length}`}>
        <span style={{ width: `${((index + 1) / list.length) * 100}%` }} />
      </div>
      <p className="muted">{label} · {index + 1} of {list.length} · {q.table}</p>
      <h2>{q.text}</h2>
      <p className="muted">Choose all that apply.</p>
      <Choice multi name={q.id} options={q.options} value={a.selected} onChange={(v) => setA({ ...a, selected: v as string[] })} />
      {showText ? (
        <LimitedText
          label={a.selected.includes("other") ? "Describe “Other”" : "Expand your answer (optional)"}
          value={a.other_text}
          onChange={(v) => setA({ ...a, other_text: v })}
        />
      ) : (
        <button type="button" className="link" onClick={() => setMore(true)}>+ Expand my answer</button>
      )}
      <fieldset className="item">
        <legend>What kind of opinion is this?</legend>
        <Choice name={`${q.id}-type`} options={opinionTypes} value={a.opinion_type} onChange={(v) => setA({ ...a, opinion_type: v as string })} />
      </fieldset>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button type="button" className="ghost" onClick={onBack}>Back</button>
        <button>{index + 1 === list.length ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
}
