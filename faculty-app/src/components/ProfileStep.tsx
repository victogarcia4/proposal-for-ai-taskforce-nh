import { useState } from "react";
import { categories, divisions, yearsTeaching } from "../content.mjs";
import { validateProfile, type Profile } from "../validation.mjs";
import { saveProfile } from "../data";

export function ProfileStep({ initial, onDone }: { initial: Partial<Profile>; onDone: () => void }) {
  const [p, setP] = useState<Profile>({ category: "", division: "", years: "", privacy: false, ...initial });
  const [error, setError] = useState("");
  const select = (key: "category" | "division" | "years", label: string, options: string[]) => (
    <label className="field">
      {label}
      <select value={p[key]} onChange={(e) => setP({ ...p, [key]: e.target.value })}>
        <option value="">Choose…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  return (
    <form
      className="card"
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = validateProfile(p);
        if (problem) return setError(problem);
        try {
          await saveProfile(p);
          onDone();
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <h2>About you</h2>
      <p>No name is collected. Results are reported only as group totals.</p>
      {select("category", "Faculty category", categories)}
      {select("division", "Division", divisions)}
      {select("years", "Years teaching", yearsTeaching)}
      <label className="check">
        <input type="checkbox" checked={p.privacy} onChange={(e) => setP({ ...p, privacy: e.target.checked })} />
        <span>
          I understand that only the consultation administrator can see individual answers. I will not enter student
          records, grades, IDs, passwords, or details that identify other people.
        </span>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row end"><button>Continue</button></div>
    </form>
  );
}
