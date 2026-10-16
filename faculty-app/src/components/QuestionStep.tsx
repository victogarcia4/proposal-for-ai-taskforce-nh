import { useEffect, useState } from "react";
import { opinionTypes, type Question } from "../content.mjs";
import { validateAnswer, type Answer } from "../validation.mjs";
import { saveAnswer } from "../data";
import { Choice, LimitedText } from "./Fields";

const blank = (question_id: string): Answer => ({ question_id, selected: [], other_text: "", opinion_type: "" });

export function QuestionStep({ list, index, label, saved, editing, onSaved, onBack, onNext }: {
  list: Question[];
  index: number;
  label: string;
  saved: Answer | undefined;
  editing?: boolean;
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
  const current = () => (showText ? a : { ...a, other_text: "" });

  // Going back keeps a complete answer instead of discarding it.
  async function back() {
    const answer = current();
    if (!validateAnswer(answer)) {
      try {
        await saveAnswer(answer, "Submitted");
        onSaved(answer);
      } catch (err) {
        return setError((err as Error).message);
      }
    }
    onBack();
  }
  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        const answer = current();
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
        <button type="button" className="ghost" onClick={back}>{editing ? "Back to review" : "Back"}</button>
        <button>{editing ? "Save changes" : index + 1 === list.length ? "Finish" : "Next"}</button>
      </div>
    </form>
  );
}
