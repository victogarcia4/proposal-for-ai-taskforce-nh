import { MAX_TEXT, type Option } from "../content.mjs";

export function Choice({ name, options, value, onChange, multi }: {
  name: string;
  options: Option[];
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (id: string) => {
    if (!multi) return onChange(id);
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange([...next]);
  };
  return (
    <div className="choices" role={multi ? "group" : "radiogroup"}>
      {options.map((o) => (
        <label key={o.id} className={selected.has(o.id) ? "choice on" : "choice"}>
          <input
            type={multi ? "checkbox" : "radio"}
            name={name}
            checked={selected.has(o.id)}
            onChange={() => toggle(o.id)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function LimitedText({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text">
      <span>{label}</span>
      <textarea
        maxLength={MAX_TEXT}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <small className={value.length > MAX_TEXT - 50 ? "count warn" : "count"}>
        {value.length}/{MAX_TEXT}
      </small>
    </label>
  );
}
