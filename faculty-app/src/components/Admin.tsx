import { useEffect, useState } from "react";
import { opinionTypes, type Option } from "../content.mjs";
import { loadAll, type AllData } from "../data";
import { summarize, toCsv } from "../report.mjs";

function Bars({ options, counts, n }: { options: Option[]; counts: Record<string, number>; n: number }) {
  return (
    <ul className="bars">
      {options.map((o) => {
        const v = counts[o.id] ?? 0;
        return (
          <li key={o.id}>
            <span className="bar-label">{o.label}</span>
            <span className="bar"><span style={{ width: n ? `${(v / n) * 100}%` : 0 }} /></span>
            <span className="bar-value">{v}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Admin() {
  const [all, setAll] = useState<AllData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { loadAll().then(setAll).catch((e) => setError(e.message)); }, []);
  if (error) return <p className="error card">{error}</p>;
  if (!all) return <p className="card">Loading…</p>;
  const s = summarize(all);

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(all)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "north-harris-faculty-ai.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="stack">
      <section className="card">
        <h2>Results</h2>
        <p><b>{s.participants}</b> faculty profiles · <b>{s.surveySummary[0]?.n ?? 0}</b> completed surveys</p>
        <p className="muted">Individual answers are visible only here. Share outside the consultation only as group totals.</p>
        <button onClick={download}>Export CSV</button>
      </section>
      <section className="card">
        <h2>Part A · General AI use</h2>
        {s.surveySummary.map(({ item, n, counts, rows }) => (
          <div key={item.id} className="item">
            <h3>{item.id}. {item.text}</h3>
            {counts && <Bars options={item.options!} counts={counts} n={n} />}
            {rows?.map(({ row, counts }) => (
              <div key={row.id}>
                <h4>{row.label}</h4>
                <Bars options={item.options!} counts={counts} n={n} />
              </div>
            ))}
          </div>
        ))}
      </section>
      <section className="card">
        <h2>Part B · Working-table questions</h2>
        {s.questionSummary.map(({ question, n, counts, types, texts }) => (
          <details key={question.id} className="item">
            <summary><b>{question.id}</b> {question.text} <span className="muted">({n})</span></summary>
            <Bars options={question.options} counts={counts} n={n} />
            <h4>Type of opinion</h4>
            <Bars options={opinionTypes} counts={types} n={n} />
            {texts.length > 0 && (
              <>
                <h4>Written answers</h4>
                <ul className="texts">
                  {texts.map((t, i) => (
                    <li key={i}><span className="tag">{opinionTypes.find((o) => o.id === t.type)?.label}</span> {t.text}</li>
                  ))}
                </ul>
              </>
            )}
          </details>
        ))}
      </section>
    </div>
  );
}
