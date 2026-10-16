const benefits = [
  {
    title: "For our students",
    items: [
      "Clear, consistent AI expectations from course to course",
      "Fair review when AI misuse is suspected, never a detector score alone",
      "Assignments that build the AI skills employers expect",
      "Equal access and alternatives when a tool is unavailable or declined",
      "Their records and data kept out of unsafe tools",
    ],
  },
  {
    title: "For faculty",
    items: [
      "A shared baseline, so each instructor isn't deciding alone",
      "Your discipline's needs heard before recommendations are written",
      "Training in the formats and times you actually prefer",
      "Equal voice and support for adjunct faculty",
    ],
  },
  {
    title: "For the LSC community",
    items: [
      "Evidence from our own faculty, not only national surveys",
      "Gaps identified so everyone starts from the same route",
      "Recommendations aligned with LSC policy, OTS guidance and Texas requirements",
      "A human-led process the Task Force can build on",
    ],
  },
];

export function Intro() {
  return (
    <section className="card intro">
      <h2>Why your voice matters</h2>
      <p className="lead">
        AI is already in our classrooms, in our students' homework and in our own work. The North Harris AI Task Force
        wants to develop <b>general recommendations</b> based on what faculty actually experience: how you use AI,
        what worries you, and what you hope for, so that we use this tool to benefit our students.
      </p>
      <div className="benefits">
        {benefits.map((b) => (
          <div key={b.title} className="benefit">
            <h3>{b.title}</h3>
            <ul>{b.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="muted">
        How your answers are used: results are reviewed by people, reported only as group totals, and turned into
        recommendations for the campus. No individual answer is shared, and no name is collected.
      </p>
    </section>
  );
}
