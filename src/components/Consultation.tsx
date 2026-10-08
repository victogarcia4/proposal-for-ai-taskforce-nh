import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import tables from "virtual:question-bank";
import { api, supabase, exportMaterial } from "../lib/supabase";
import { ADMIN_EMAIL, isEmployeeEmail } from "../lib/access-policy.mjs";
import { PRIVACY_NOTICE, PRIVACY_NOTICE_VERSION, suppressedDistribution } from "../lib/privacy.mjs";
import { Attachments } from "./Attachments";
import {
  categories,
  disciplines,
  contributionTypes,
  scopes,
  strengths,
  routes,
  positions,
  dispositions,
  primer,
  command,
  formatDate,
  type Feed,
  type Profile,
  type Proposal,
  type Norm,
  type Command,
} from "../lib/consultation";
import { sources, briefings } from "../lib/content";
import { initialDemo, demoWrite, visibleDemo, demoProfiles } from "../lib/demo";

type Page =
  | "Overview"
  | "Working tables"
  | "Proposals"
  | "My contributions"
  | "Committee"
  | "Draft norms"
  | "What we heard"
  | "Practice library"
  | "Sources & PRIMER"
  | "Profile"
  | "Administration";
const pages: Page[] = [
  "Profile",
  "Overview",
  "Working tables",
  "Proposals",
  "My contributions",
  "Draft norms",
  "What we heard",
  "Practice library",
  "Sources & PRIMER",
];
const value = (form: HTMLFormElement, key: string) =>
  String(new FormData(form).get(key) || "").trim();
function EmailSignIn({
  email,
  setEmail,
  code,
  setCode,
  codeSent,
  busy,
  onSubmit,
  onVerify,
}: {
  email: string;
  setEmail: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  codeSent: boolean;
  busy: boolean;
  onSubmit: () => void;
  onVerify: () => void;
}) {
  return (
    <div className="nh-email-signin">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="nh-field">
          <span>Lone Star email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@lonestar.edu"
            autoComplete="email"
            required
          />
        </label>
        <button className="nh-primary" type="submit" disabled={busy}>
          Send me a sign-in code
        </button>
      </form>
      {codeSent && (
        <form
          className="nh-code-form"
          onSubmit={(event) => {
            event.preventDefault();
            onVerify();
          }}
        >
          <label className="nh-field">
            <span>Email verification code</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6,10}"
              maxLength={10}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="12345678"
              autoComplete="one-time-code"
              required
            />
          </label>
          <button type="submit" disabled={busy || code.length < 6}>
            Verify code
          </button>
        </form>
      )}
    </div>
  );
}
function Field({
  label,
  name,
  options,
  defaultValue = "",
  required = true,
  area = false,
  maxLength,
  type = "text",
  placeholder = false,
}: {
  label: string;
  name: string;
  options?: readonly string[];
  defaultValue?: string;
  required?: boolean;
  area?: boolean;
  maxLength?: number;
  type?: string;
  placeholder?: boolean;
}) {
  return (
    <label className="nh-field">
      <span>
        {label}
        {!required && " (optional)"}
      </span>
      {options ? (
        <select
          name={name}
          defaultValue={defaultValue || (placeholder ? "" : options[0])}
          required={required}
        >
          {placeholder && <option value="">Choose an answer</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : area ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={4}
          maxLength={maxLength}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          required={required}
          maxLength={maxLength}
          type={type}
        />
      )}
    </label>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return <div className="nh-empty">{children}</div>;
}
export function Consultation() {
  const [page, setPage] = useState<Page>("Profile"),
    [feed, setFeed] = useState<Feed | null>(null),
    [demo, setDemo] = useState(false),
    [actor, setActor] = useState("demo-participant"),
    [email, setEmail] = useState(""),
    [emailCode, setEmailCode] = useState(""),
    [emailCodeSent, setEmailCodeSent] = useState(false),
    [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const allDemo = useRef<Feed>(initialDemo()),
    [session, setSession] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [table, setTable] = useState("T1"),
    [filterTable, setFilterTable] = useState("all"),
    [question, setQuestion] = useState("T1Q1"),
    [edit, setEdit] = useState<Proposal | null>(null),
    [depth, setDepth] = useState("Quick response"),
    [selected, setSelected] = useState(""),
    [theme, setTheme] = useState("light");
  const pending = useRef<Command | null>(null),
    saving = useRef(false),
    generation = useRef(0);
  const profile = feed?.profile,
    roles = profile?.roles || [],
    profileComplete = Boolean(
      profile?.name.trim() && profile.institutional_email && categories.includes(profile.category),
    ),
    editor = roles.includes("Administrator"),
    admin = roles.includes("Administrator"),
    facilitator = editor || roles.includes("Facilitator");
  useEffect(() => {
    try {
      setTheme(localStorage.getItem("nh-consultation-theme") || "light");
    } catch {}
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      if (data.session) refresh();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
      if (s) setTimeout(() => refresh(), 0);
      else setFeed(null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.nhTheme = theme;
  }, [theme]);
  useEffect(() => {
    if (demo) setFeed(visibleDemo(allDemo.current, actor));
  }, [actor, demo]);
  async function refresh() {
    const current = generation.current;
    setBusy(true);
    try {
      const result = await api();
      if (current === generation.current) {
        setFeed(result);
        if (!result.profile?.name.trim() || !result.profile.institutional_email)
          setPage("Profile");
        setError("");
      }
    } catch (e) {
      if (current === generation.current) setError((e as Error).message);
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  async function write(cmd: Command): Promise<boolean> {
    if (["profile", "proposal", "comment", "position", "pulse"].includes(cmd.action)) {
      if (!privacyAcknowledged) {
        setError("Read and acknowledge the participation privacy notice above before saving.");
        return false;
      }
      cmd = { ...cmd, privacy_notice_version: PRIVACY_NOTICE_VERSION };
    }
    if (saving.current) return false;
    saving.current = true;
    const currentGeneration = generation.current;
    setBusy(true);
    setError("");
    setMessage("Saving…");
    pending.current = cmd;
    try {
      if (demo) {
        allDemo.current = demoWrite(
          allDemo.current,
          cmd,
          allDemo.current.profiles.find((p) => p.id === actor)!,
        );
        setFeed(visibleDemo(allDemo.current, actor));
        setMessage("Saved in this demo session.");
      } else {
        await api("POST", cmd);
        if (currentGeneration !== generation.current) return false;
        setMessage("Saved to the consultation database.");
        try {
          setFeed(await api());
        } catch {
          setError(
            "Your save succeeded, but the list could not refresh. Refresh the page to load it.",
          );
        }
      }
      pending.current = null;
      return true;
    } catch (e) {
      setError((e as Error).message);
      setMessage("Save failed. Your form is still available.");
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function signIn() {
    setError("");
    if (!privacyAcknowledged) { setError("Read and acknowledge the participation privacy notice before requesting a code."); return; }
    if (!supabase) {
      setError("The Supabase publishable key is not configured.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmployeeEmail(normalizedEmail)) {
      setError("Use an employee @lonestar.edu email. Students cannot participate.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    });
    if (error) setError(error.message);
    else {
      setEmailCodeSent(true);
      setEmailCode("");
      setMessage("Check your Lone Star email for the sign-in code.");
    }
  }
  async function verifyEmailCode() {
    setError("");
    if (!supabase) {
      setError("The Supabase publishable key is not configured.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[0-9]{6,10}$/.test(emailCode)) {
      setError("Enter the 6–10 digit code from your Lone Star email.");
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: emailCode,
      type: "email",
    });
    if (error) setError(error.message);
    else setMessage("Email verified. Loading your profile…");
  }
  async function signOut() {
    generation.current++;
    try {
      if (profile)
        Object.keys(localStorage)
          .filter((k) => k.startsWith(`nh-draft-${profile.id}-`))
          .forEach((k) => localStorage.removeItem(k));
      if (profile) Object.keys(sessionStorage).filter((k) => k.startsWith(`nh-draft-${profile.id}-`)).forEach((k) => sessionStorage.removeItem(k));
    } catch {}
    if (supabase) await supabase.auth.signOut();
    setDemo(false);
    setPrivacyAcknowledged(false);
    setFeed(null);
    setSession(false);
    setEmailCodeSent(false);
    setEmailCode("");
    setEdit(null);
    pending.current = null;
    setBusy(false);
    setMessage("Signed out. Local drafts cleared.");
  }
  async function adminSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    if (!privacyAcknowledged) { setError("Read and acknowledge the participation privacy notice before signing in."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: String(new FormData(form).get("password") || "") });
      if (error) throw error;
      form.reset();
      setDemo(false);
      setMessage("Administrator signed in. Loading the consultation…");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function exportAdmin(format: "csv" | "pdf") {
    setBusy(true); setError("");
    try { await exportMaterial(format); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  function navigate(target: Page) {
    setPage(target);
    setSelected("");
    setEdit(null);
    setMessage("");
    document.getElementById("nh-main")?.focus();
  }
  const tableData = tables.find((t) => t.id === table)!;
  const chosenQuestion = tables
    .flatMap((t) => t.questions)
    .find((q) => q.id === question)!;
  const mine = feed?.proposals.filter((p) => p.author_id === profile?.id) || [];
  const submitted =
    feed?.proposals.filter((p) => p.status === "Submitted") || [];
  function author(p: Proposal) {
    const a = feed?.profiles.find((u) => u.id === p.author_id);
    return a?.name || "Member";
  }
  function editProposal(p: Proposal) {
    setEdit(p);
    setDepth(p.content.depth);
    setQuestion(p.question_id);
    setTable(p.question_id.slice(0, 2));
    setPage("Working tables");
  }
  function proposalList(items: Proposal[]) {
    return items.length ? (
      <div className="nh-proposals">
        {items.map((p) => (
          <article className="nh-proposal" key={p.id}>
            <div className="nh-meta">
              <span>
                {p.question_id} · Revision {p.revision} · {p.status}
              </span>
              <span>{p.content.type}</span>
            </div>
            <h3>{p.content.statement}</h3>
            <p className="nh-muted">
              {author(p)}
              {p.content.collective === "true"
                ? " · Collective session contribution"
                : ""}
            </p>
            <p>
              {p.content.scope || "Scope not specified"} ·{" "}
              {formatDate(p.created_at)}
            </p>
            {p.disposition && (
              <div className="nh-disposition">
                <strong>{p.disposition.outcome}</strong>
                <p>{p.disposition.reason}</p>
              </div>
            )}
            <div className="nh-actions">
              <button
                onClick={() => setSelected(selected === p.id ? "" : p.id)}
              >
                {admin ? "View discussion & history" : "View discussion"}
              </button>
              {p.author_id === profile?.id && (
                <button onClick={() => editProposal(p)}>Revise / expand</button>
              )}
            </div>
            {selected === p.id && (
              <>
                <dl className="nh-details">
                  {Object.entries(p.content)
                    .filter(
                      ([k, v]) =>
                        v &&
                        !["statement", "type", "depth", "visibility"].includes(
                          k,
                        ),
                    )
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k.replaceAll("_", " ")}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                {admin && <details>
                  <summary>Revision history ({p.history?.length || 0})</summary>
                  {p.history?.map((h) => (
                    <div key={h.revision}>
                      <strong>Revision {h.revision}</strong>
                      <p>{h.content.statement}</p>
                    </div>
                  ))}
                </details>}
                <Attachments
                  proposalId={p.id}
                  canUpload={p.author_id === profile?.id}
                  demo={demo}
                />
                {p.status === "Submitted" && (
                  <Discussion
                    kind="proposal"
                    target={p.id}
                    revision={p.revision}
                    feed={feed!}
                    write={write}
                    busy={busy}
                  />
                )}
              </>
            )}
          </article>
        ))}
      </div>
    ) : (
      <Empty>
        No contributions here yet. Choose a working table to add your voice.
      </Empty>
    );
  }
  return (
    <div className="nh-app" data-admin={admin && !demo ? "true" : "false"}>
      <a className="nh-skip" href="#nh-main">
        Skip to content
      </a>
      <header className="nh-header">
        <a
          className="nh-brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("Overview");
          }}
        >
          <img
            src="/LSC-North%20Harris%20logo.png"
            alt="Lone Star College–North Harris"
          />
          <span>
            AI Use Norms
            <br />
            <small>Campus consultation</small>
          </span>
        </a>
        <div className="nh-header-actions">
          <button
            onClick={() => {
              const t = theme === "light" ? "dark" : "light";
              setTheme(t);
              try {
                localStorage.setItem("nh-consultation-theme", t);
              } catch {}
            }}
          >
            {theme === "light" ? "Night theme" : "Day theme"}
          </button>
          {admin && !demo && <>
            <button disabled={busy} onClick={() => exportAdmin("csv")}>Export CSV</button>
            <button disabled={busy} onClick={() => exportAdmin("pdf")}>Export PDF</button>
          </>}
          {(demo || session) && <button onClick={signOut}>Sign out</button>}
        </div>
      </header>
      {demo && (
        <div className="nh-demo">
          <strong>
            Demo workspace · fictitious data · saved only for this session
          </strong>
          <label>
            Explore as{" "}
            <select value={actor} onChange={(e) => setActor(e.target.value)}>
              {demoProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.institutional_email} ({p.roles.at(-1)})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="nh-layout">
        <aside className="nh-sidebar">
          <nav aria-label="Consultation">
            {pages.map((p) => (
              <button
                key={p}
                aria-current={page === p ? "page" : undefined}
                onClick={() => navigate(p)}
              >
                {p}
              </button>
            ))}
            {editor && (
              <button
                aria-current={page === "Committee" ? "page" : undefined}
                onClick={() => navigate("Committee")}
              >
                Committee workspace
              </button>
            )}
            {admin && (
              <button
                aria-current={page === "Administration" ? "page" : undefined}
                onClick={() => navigate("Administration")}
              >
                Administration
              </button>
            )}
          </nav>
          <div className="nh-sidebar-bottom">
            <p>
              Listen. Discuss.
              <br />
              Build shared norms.
            </p>
            <small>
              Human coding and synthesis.
              <br />
              All positions welcome.
            </small>
            {profile && (
              <p className="nh-member">
                {profile.name}
                <br />
                <small>{profile.institutional_email}</small>
                <br />
                <small>{roles.join(" · ")}</small>
              </p>
            )}
          </div>
        </aside>
        <main id="nh-main" tabIndex={-1} className="nh-main">
          <section className="nh-privacy-notice" aria-labelledby="privacy-notice-title">
            <h2 id="privacy-notice-title">Participation privacy notice</h2>
            <p>{PRIVACY_NOTICE}</p>
            <p>Share results outside the consultation only after institutional review. Aggregate counts and edited themes can still identify people in small groups.</p>
            <label><input type="checkbox" checked={privacyAcknowledged} onChange={(e) => setPrivacyAcknowledged(e.target.checked)} /> I understand the visibility of my contributions and will use general or fictional examples.</label>
          </section>
          <div className="nh-alerts" aria-live="polite">
            {message && <p role="status">{message}</p>}
            {error && (
              <div role="alert" className="nh-error">
                {error}
                {pending.current && (
                  <button
                    disabled={busy}
                    onClick={() => write(pending.current!)}
                  >
                    Retry same save
                  </button>
                )}
              </div>
            )}
          </div>
          {page === "Overview" && (
            <>
              <div className="nh-hero">
                <p className="nh-kicker">
                  North Harris · Faculty, adjuncts & staff
                </p>
                <h1>
                  Your experience shapes
                  <br />
                  our AI use norms.
                </h1>
                <p>
                  Share a concern, a useful practice, or a recommendation. See
                  how the committee responds and help refine the draft.
                </p>
                <div className="nh-actions">
                  {profile ? (
                    <button
                      className="nh-primary"
                      onClick={() =>
                        navigate(profileComplete ? "Working tables" : "Profile")
                      }
                    >
                      {profileComplete
                        ? "Contribute to a table"
                        : "Complete your profile"}
                    </button>
                  ) : (
                    <EmailSignIn
                      email={email}
                      setEmail={setEmail}
                      code={emailCode}
                      setCode={setEmailCode}
                      codeSent={emailCodeSent}
                      busy={busy}
                      onSubmit={signIn}
                      onVerify={verifyEmailCode}
                    />
                  )}
                  <button
                    onClick={() => {
                      setDemo(true);
                      setError("");
                      setPage("Profile");
                    }}
                  >
                    Explore the demo
                  </button>
                </div>
                {!profile && (
                  <p className="nh-muted">
                    Verified Lone Star email and a completed profile are
                    required to submit.
                  </p>
                )}
              </div>
              <div className="nh-overview-strip">
                <div>
                  <strong>6</strong>
                  <span>Working tables</span>
                </div>
                <div>
                  <strong>24</strong>
                  <span>Questions to explore</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>Ways to contribute</span>
                </div>
                <div>
                  <strong>All</strong>
                  <span>Perspectives welcome</span>
                </div>
              </div>
              <section>
                <h2>How your voice becomes a norm</h2>
                <ol className="nh-process">
                  <li>
                    <strong>Share your experience</strong>
                    <p>
                      A quick response takes a few minutes. Full proposals give
                      you room for evidence and examples.
                    </p>
                  </li>
                  <li>
                    <strong>Discuss and synthesize</strong>
                    <p>
                      Members respond with reasons. The committee records
                      agreement, reservations, minority views, and gaps.
                    </p>
                  </li>
                  <li>
                    <strong>Review the draft</strong>
                    <p>
                      Comment on each norm and see its evidence, review date,
                      and route to the body that can act.
                    </p>
                  </li>
                </ol>
              </section>
              <section className="nh-note">
                <h2>Who sees what</h2>
                <p>
                  Submitted contributions show your name, employment category,
                  and unit to consultation members. Your drafts stay private.
                  Pulse answers appear only in aggregates of at least five
                  people. Email addresses and sign-in details are not shown to
                  members.
                </p>
                <p>
                  This is an advisory consultation. OTS owns tool approvals;
                  institutional reviewers confirm the adoption route and
                  public-records handling. Development participation uses
                  fictitious data until those prerequisites are confirmed.
                </p>
              </section>
              {feed?.notifications.length ? (
                <section>
                  <h2>Updates for you</h2>
                  {feed.notifications.map((n) => (
                    <p key={n.id}>{n.message}</p>
                  ))}
                </section>
              ) : null}
            </>
          )}
          {page !== "Overview" && !profile && (
            <section className="nh-gate">
              <h1>{page}</h1>
              <p>
                Employees: enter your @lonestar.edu email address. Students do not participate. We
                will send you a secure sign-in code. You can also explore the
                complete workflow with fictitious demo data.
              </p>
              <div className="nh-actions">
                <EmailSignIn
                  email={email}
                  setEmail={setEmail}
                  code={emailCode}
                  setCode={setEmailCode}
                  codeSent={emailCodeSent}
                  busy={busy}
                  onSubmit={signIn}
                  onVerify={verifyEmailCode}
                />
                <button
                  onClick={() => {
                    setDemo(true);
                    setError("");
                  }}
                >
                  Explore demo workspace
                </button>
                {session && (
                  <button onClick={refresh} disabled={busy}>
                    Check membership again
                  </button>
                )}
              </div>
              <details className="nh-admin-login">
                <summary>Administrator sign-in</summary>
                <form className="nh-form" onSubmit={adminSignIn}>
                  <label className="nh-field"><span>Administrator email</span><input type="email" value={ADMIN_EMAIL} readOnly autoComplete="username" /></label>
                  <label className="nh-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
                  <button disabled={busy}>Sign in as administrator</button>
                </form>
              </details>
            </section>
          )}
          {profile && feed && (
            <>
              {!profileComplete && page !== "Profile" && (
                <section className="nh-gate">
                  <h1>Complete your profile first</h1>
                  <p>
                    Your name and verified Lone Star institutional email are
                    required before you can participate. Your email is visible
                    only to you and is never shown in member directories or
                    contributions.
                  </p>
                  <button
                    className="nh-primary"
                    onClick={() => navigate("Profile")}
                  >
                    Complete profile
                  </button>
                </section>
              )}
              {(profileComplete || page === "Profile") && (
                <>
                  {page === "Working tables" && (
                    <>
                      <div className="nh-page-heading">
                        <p className="nh-kicker">The listening round</p>
                        <h1>Six tables. Many perspectives.</h1>
                        <p>
                          Choose the question closest to your work. You do not
                          need to answer every question.
                        </p>
                      </div>
                      <div
                        className="nh-table-navigation"
                        aria-label="Working tables"
                      >
                        {tables.map((t) => (
                          <button
                            key={t.id}
                            aria-pressed={table === t.id}
                            onClick={() => {
                              setTable(t.id);
                              setQuestion(t.questions[0].id);
                              setEdit(null);
                            }}
                          >
                            <span>{t.id}</span>
                            {t.title}
                          </button>
                        ))}
                      </div>
                      <section>
                        <h2>{tableData.title}</h2>
                        <p>{tableData.deliverable}</p>
                        <div className="nh-briefings">
                          <div>
                            <h3>What LSC already says</h3>
                            <p>{briefings[Number(table[1]) - 1][0]}</p>
                          </div>
                          <div>
                            <h3>What others have found</h3>
                            <p>{briefings[Number(table[1]) - 1][1]}</p>
                          </div>
                        </div>
                        <p className="nh-muted">
                          Briefing prepared from the plan on October 2, 2026;
                          policy sections await institutional verification.{" "}
                          <a
                            href="https://www.lonestar.edu/OTS-AI-Tools"
                            target="_blank"
                            rel="noreferrer"
                          >
                            OTS live tool list checked October 2, 2026
                          </a>
                          . Tool approval remains with OTS.
                        </p>
                        <div className="nh-source-links">
                          {briefings[Number(table[1]) - 1][2].map((id) => {
                            const s = sources.find((s) => s.id === id)!;
                            return (
                              <a
                                key={id}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.title} ↗
                              </a>
                            );
                          })}
                        </div>
                      </section>
                      <div className="nh-question-list">
                        {tableData.questions.map((q) => (
                          <button
                            key={q.id}
                            aria-pressed={question === q.id}
                            onClick={() => {
                              setQuestion(q.id);
                              setEdit(null);
                            }}
                          >
                            <span>{q.id}</span>
                            {q.text}
                          </button>
                        ))}
                      </div>
                      <p className="nh-muted">
                        Prompts to consider: {tableData.probes}
                      </p>
                      <section className="nh-composer">
                        <p className="nh-kicker">
                          {question} · Question wording version 2
                        </p>
                        <h2>
                          {edit
                            ? "Revise your contribution"
                            : "Add your perspective"}
                        </h2>
                        <p>{chosenQuestion.text}</p>
                        <div
                          className="nh-segment"
                          aria-label="Contribution depth"
                        >
                          {["Quick response", "Full proposal"].map((d) => (
                            <button
                              key={d}
                              aria-pressed={depth === d}
                              onClick={() => setDepth(d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                        <ProposalForm
                          key={`${question}-${edit?.id || "new"}-${depth}`}
                          question={question}
                          depth={depth}
                          edit={edit}
                          profile={profile}
                          sessions={feed.sessions}
                          facilitator={facilitator}
                          busy={busy}
                          demo={demo}
                          write={write}
                          onDone={() => setEdit(null)}
                        />
                      </section>
                      <section>
                        <h2>Contributions on this question</h2>
                        {proposalList(
                          submitted.filter((p) => p.question_id === question),
                        )}
                      </section>
                    </>
                  )}
                  {page === "Proposals" && (
                    <>
                      <h1>Proposals & discussion</h1>
                      <p>
                        Support, support with changes, and disagreement all
                        carry a reason. Positions apply to the current proposal
                        version.
                      </p>
                      <label className="nh-field">
                        <span>Filter by table</span>
                        <select
                          value={filterTable}
                          onChange={(e) => setFilterTable(e.target.value)}
                        >
                          <option value="all">All tables</option>
                          {tables.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      {proposalList(
                        submitted.filter(
                          (p) =>
                            filterTable === "all" ||
                            p.question_id.startsWith(filterTable),
                        ),
                      )}
                    </>
                  )}
                  {page === "My contributions" && (
                    <>
                      <h1>My contributions</h1>
                      <p>
                        Your saved drafts, submitted proposals, and administrator
                        responses.
                      </p>
                      {proposalList(mine)}
                      <h2>Baseline & closing pulse</h2>
                      <p>
                        Optional. Six items help the committee understand the
                        starting point. Shared results appear only in aggregate.
                        Answers are linked to your account in storage for revisions.
                      </p>
                      <PulseForm busy={busy} write={write} />
                    </>
                  )}
                  {page === "Profile" && (
                    <>
                      <h1>Start with your profile</h1>
                      <p>
                        Enter your name and confirm employee status to participate.
                        Your verified account email is shown below. Employment
                        categories do not grant administrative permissions.
                      </p>
                      <form
                        className="nh-form"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const f = e.currentTarget;
                          await write(
                            command(
                              "profile",
                              { ...Object.fromEntries(
                                [
                                  "name",
                                  "category",
                                  "unit",
                                  "discipline",
                                  "years",
                                ].map((k) => [k, value(f, k)]),
                              ), employee_confirmed: new FormData(f).get("employee_confirmed") === "on" },
                            ),
                          );
                        }}
                      >
                        <label className="nh-field">
                          <span>Verified account email</span>
                          <input
                            value={profile.institutional_email || ""}
                            readOnly
                            aria-describedby="institutional-email-note"
                          />
                          <small id="institutional-email-note">
                            Authentication verifies this email. It is not shown
                            to other participants.
                          </small>
                        </label>
                        <Field
                          name="name"
                          label="Full name"
                          defaultValue={profile.name}
                        />
                        <Field
                          name="category"
                          label="Employment category"
                          options={categories}
                          defaultValue={profile.category}
                          placeholder
                        />
                        <Field
                          name="unit"
                          label="Division or unit"
                          defaultValue={profile.unit}
                          required={false}
                        />
                        <Field
                          name="discipline"
                          label="Discipline cluster"
                          options={["Prefer not to say", ...disciplines]}
                          defaultValue={profile.discipline || "Prefer not to say"}
                        />
                        <Field
                          name="years"
                          label="Years at LSC"
                          options={[
                            "Less than 1 year",
                            "1–5 years",
                            "6–10 years",
                            "11+ years",
                            "Prefer not to say",
                          ]}
                          defaultValue={profile.years}
                        />
                        <label><input type="checkbox" name="employee_confirmed" required /> I confirm I am a Lone Star employee (faculty, staff, or administrator), not a student participant.</label>
                        <button className="nh-primary" disabled={busy}>
                          Save profile and continue
                        </button>
                      </form>
                    </>
                  )}
                  {page === "Committee" && editor && (
                    <Committee
                      feed={feed}
                      busy={busy}
                      write={write}
                      selected={selected}
                      setSelected={setSelected}
                      author={author}
                    />
                  )}
                  {page === "Draft norms" && (
                    <DraftNorms
                      feed={feed}
                      editor={editor}
                      busy={busy}
                      write={write}
                    />
                  )}
                  {page === "What we heard" && (
                    <Heard feed={feed} editor={editor} />
                  )}
                  {page === "Practice library" && (
                    <>
                      <h1>Practice library</h1>
                      <p>
                        Committee-approved practices shared by consultation
                        members.
                      </p>
                      {proposalList(
                        submitted.filter(
                          (p) =>
                            p.content.type === "Practice to share" &&
                            p.practice_approved,
                        ),
                      )}
                    </>
                  )}
                  {page === "Sources & PRIMER" && <SourcesPrimer />}
                  {page === "Administration" && admin && (
                    <Admin feed={feed} busy={busy} write={write} />
                  )}
                </>
              )}
            </>
          )}
          <footer className="nh-footer">
            <span>North Harris AI Task Force · Human-led consultation</span>
            <span className="nh-credit">
              <img
                src="/VHGM%20traje%20azul.png"
                alt=""
                className="nh-credit-photo"
              />
              <span>Dr. Victor Garcia Martinez · Application creator</span>
            </span>
            <a href="/archive">Original working-session archive</a>
          </footer>
        </main>
      </div>
    </div>
  );
}

function ProposalForm({
  question,
  depth,
  edit,
  profile,
  sessions,
  facilitator,
  busy,
  demo,
  write,
  onDone,
}: {
  question: string;
  depth: string;
  edit: Proposal | null;
  profile: Profile;
  sessions: Feed["sessions"];
  facilitator: boolean;
  busy: boolean;
  demo: boolean;
  write: (c: Command) => Promise<boolean>;
  onDone: () => void;
}) {
  const form = useRef<HTMLFormElement>(null),
    [chars, setChars] = useState(edit?.content.statement?.length || 0),
    [local, setLocal] = useState("");
  const key = `nh-draft-${profile.id}-v2-${question}`;
  useEffect(() => {
    if (edit) return;
    try {
      const previous = localStorage.getItem(key);
      if (previous && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, previous);
        localStorage.removeItem(key);
      }
      const data = JSON.parse(sessionStorage.getItem(key) || "null");
      if (data && form.current) {
        for (const [name, v] of Object.entries(data)) {
          const el = form.current.elements.namedItem(
            name,
          ) as HTMLInputElement | null;
          if (el) el.value = String(v);
        }
        setChars(data.statement?.length || 0);
        setLocal("Your draft was restored in this browser tab.");
      }
    } catch {}
  }, [key, edit]);
  async function save(status: string) {
    if (!form.current) return;
    const f = form.current;
    if (status === "Submitted" && !f.reportValidity()) return;
    const content = Object.fromEntries(new FormData(f).entries()) as Record<
      string,
      string
    >;
    content.depth = depth;
    content.visibility = "Members";
    if (
      status === "Submitted" &&
      depth === "Quick response" &&
      content.statement.length > 600
    ) {
      setLocal("Quick responses are limited to 600 characters.");
      return;
    }
    const ok = await write(
      command("proposal", {
        id: edit?.id,
        revision: edit?.revision,
        question_id: question,
        status,
        content,
      }),
    );
    if (ok) {
      try {
        sessionStorage.removeItem(key);
      } catch {}
      setLocal("");
      if (!edit) {
        f.reset();
        setChars(0);
      }
      onDone();
    }
  }
  return (
    <form
      ref={form}
      className="nh-form"
      onSubmit={(e) => {
        e.preventDefault();
        save("Submitted");
      }}
      onChange={() => {
        if (form.current) {
          const data = Object.fromEntries(new FormData(form.current));
          try {
            sessionStorage.setItem(key, JSON.stringify(data));
            setLocal("Draft saved in this browser tab; not submitted.");
          } catch {
            setLocal(
              "Tab storage is unavailable. Save a private database draft or keep this page open.",
            );
          }
          setChars(String(data.statement || "").length);
        }
      }}
    >
      <Field
        label="Contribution type"
        name="type"
        options={contributionTypes}
        defaultValue={edit?.content.type}
      />
      <Field
        label={
          depth === "Quick response"
            ? "Your statement (up to 600 characters)"
            : "Proposal summary"
        }
        name="statement"
        area
        maxLength={depth === "Quick response" ? 600 : 4000}
        defaultValue={edit?.content.statement}
      />
      {depth === "Quick response" && <small>{chars} / 600 characters</small>}
      {depth === "Full proposal" && (
        <>
          {[
            ["issue", "Issue observed"],
            ["recommendation", "Recommendation or requested response"],
            ["rationale", "Rationale"],
            ["example", "A practical example"],
            ["affected", "People affected"],
            ["risks", "Risks and reservations"],
            ["evidence", "Evidence or sources"],
          ].map(([name, label]) => (
            <Field
              key={name}
              label={label}
              name={name}
              area
              maxLength={4000}
              defaultValue={edit?.content[name]}
            />
          ))}
          <Field
            label="Suggested strength"
            name="strength"
            options={strengths}
            defaultValue={edit?.content.strength}
          />
        </>
      )}
      <Field
        label="Scope"
        name="scope"
        options={
          depth === "Quick response" ? ["Not specified", ...scopes] : scopes
        }
        defaultValue={edit?.content.scope}
      />
      {facilitator && (
        <>
          <Field
            label="Authorship"
            name="collective"
            options={["false", "true"]}
            defaultValue={edit?.content.collective || "false"}
          />
          <label className="nh-field">
            <span>Session (required for collective proposals)</span>
            <select
              name="session_id"
              defaultValue={edit?.content.session_id || ""}
            >
              <option value="">Individual contribution</option>
              {sessions.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name} · {s.date}
                </option>
              ))}
            </select>
          </label>
          <p className="nh-muted">
            Choose true for a collective session contribution, false for an
            individual contribution. Collective proposals do not count as
            individual responses from everyone present.
          </p>
        </>
      )}
      <p className="nh-muted">
        Your submitted response will be visible to consultation members.
        Your name is kept for account and membership management. Use general or
        fictional examples. Do not include student,
        personnel, or clinical records, even in a draft.
      </p>
      <p role="status">{local}</p>
      <div className="nh-actions">
        <button type="button" disabled={busy} onClick={() => save("Draft")}>
          Save private draft {demo ? "in demo" : ""}
        </button>
        <button className="nh-primary" disabled={busy}>
          Submit {depth.toLowerCase()}
        </button>
      </div>
      {edit && (
        <p>
          Editing revision {edit.revision}. Earlier revisions and positions
          remain in history.
        </p>
      )}
    </form>
  );
}

function Discussion({
  kind,
  target,
  revision,
  feed,
  write,
  busy,
}: {
  kind: string;
  target: string;
  revision: number;
  feed: Feed;
  write: (c: Command) => Promise<boolean>;
  busy: boolean;
}) {
  const comments = feed.comments.filter(
    (c) => c.target_id === target && c.revision === revision,
  );
  const voted = comments.filter((c) => c.position),
    previous = feed.comments.filter(
      (c) => c.target_id === target && c.revision !== revision && c.position,
    );
  return (
    <section className="nh-discussion">
      <h3>Discussion on revision {revision}</h3>
      <div className="nh-position-counts">
        {positions.map((p) => (
          <span key={p}>
            {p}: {voted.filter((c) => c.position === p).length}
          </span>
        ))}
      </div>
      <p className="nh-muted">
        {voted.length} recorded positions. Silence is not support.
        {previous.length > 0 &&
          ` ${previous.length} earlier positions remain in history and need reconfirmation on this revision.`}
      </p>
      {comments.map((c) => (
        <div className="nh-comment" key={c.id}>
          <strong>
            {feed.profiles.find((p) => p.id === c.author_id)?.name || "Member"}
            {c.position ? ` · ${c.position}` : ""}
          </strong>
          <p>{c.body}</p>
          <small>{formatDate(c.created_at)}</small>
        </div>
      ))}
      <form
        className="nh-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = e.currentTarget;
          const choice = value(f, "position");
          if (
            await write(
              command(choice === "Comment only" ? "comment" : "position", {
                kind,
                target_id: target,
                revision,
                body: value(f, "body"),
                position: choice,
              }),
            )
          )
            f.reset();
        }}
      >
        <Field
          label="Your response"
          name="position"
          options={["Comment only", ...positions]}
        />
        <Field
          label="Comment or reason for your position"
          name="body"
          area
          maxLength={4000}
        />
        <button disabled={busy}>Save response</button>
      </form>
    </section>
  );
}

function PulseForm({
  busy,
  write,
}: {
  busy: boolean;
  write: (c: Command) => Promise<boolean>;
}) {
  const items = [
    [
      "sentiment",
      "Overall sentiment about AI in your work",
      ["Positive", "Mixed", "Negative", "Unsure"],
    ],
    [
      "challenge",
      "AI in your role feels like",
      [
        "More of an opportunity",
        "Both equally",
        "More of a challenge",
        "Unsure",
      ],
    ],
    [
      "confidence",
      "Confidence handling AI in your role",
      ["Very confident", "Somewhat confident", "Starting out", "Unsure"],
    ],
    [
      "experience",
      "Have you used AI in your role?",
      ["Yes", "No", "Prefer not to say"],
    ],
    [
      "concerns",
      "Your main concern",
      [
        "Overreliance",
        "Critical thinking",
        "Privacy",
        "Bias or access",
        "Workload or job security",
        "No main concern",
        "Other",
      ],
    ],
    [
      "guidance",
      "Did you know LSC OTS AI guidance existed?",
      ["Yes", "No", "Unsure"],
    ],
  ] as const;
  return (
    <form
      className="nh-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        await write(
          command("pulse", {
            stage: value(f, "stage"),
            answers: Object.fromEntries(items.map(([k]) => [k, value(f, k)])),
          }),
        );
      }}
    >
      <Field
        label="Pulse stage"
        name="stage"
        options={["Baseline", "Closing"]}
      />
      {items.map(([name, label, options]) => (
        <Field
          key={name}
          name={name}
          label={label}
          options={options}
          placeholder
        />
      ))}
      <button disabled={busy}>Submit optional pulse</button>
    </form>
  );
}

function Committee({
  feed,
  busy,
  write,
  selected,
  setSelected,
  author,
}: {
  feed: Feed;
  busy: boolean;
  write: (c: Command) => Promise<boolean>;
  selected: string;
  setSelected: (s: string) => void;
  author: (p: Proposal) => string;
}) {
  const proposals = feed.proposals.filter((p) => p.status !== "Draft"),
    [question, setQuestion] = useState("T1Q1");
  const synthesis = feed.syntheses.find((s) => s.question_id === question);
  return (
    <>
      <h1>Committee workspace</h1>
      <p>
        Code the original contributions, record minority views, and give every
        proposal a disposition.
      </p>
      <p className="nh-muted">Only the designated administrator can export detailed consultation material using the CSV and PDF buttons above. Names, statements, and examples can identify people even without email addresses; downloaded material must be kept confidential.</p>
      <div className="nh-review-list">
        {proposals.map((p) => (
          <article key={p.id}>
            <button
              className="nh-review-heading"
              aria-expanded={selected === p.id}
              onClick={() => setSelected(selected === p.id ? "" : p.id)}
            >
              <span>
                {p.question_id} · {p.content.type}
              </span>
              <strong>{p.content.statement}</strong>
              <small>
                {author(p)} · {p.disposition?.outcome || "Awaiting disposition"}
              </small>
            </button>
            {selected === p.id && (
              <div className="nh-review-body">
                <dl className="nh-details">
                  {Object.entries(p.content).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <form
                  className="nh-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    write(
                      command("coding", {
                        id: p.id,
                        revision: p.revision,
                        codes: new FormData(f).getAll("codes"),
                        linked_ids: new FormData(f).getAll("linked_ids"),
                      }),
                    );
                  }}
                >
                  <fieldset>
                    <legend>Human coding</legend>
                    {["Theme", "Risk", "Scope", "Suggested action"].map((d) => (
                      <div key={d}>
                        <h4>{d}</h4>
                        {feed.codeCatalog
                          .filter((c) => c.dimension === d)
                          .map((c) => (
                            <label className="nh-checkbox" key={c.id}>
                              <input
                                type="checkbox"
                                name="codes"
                                value={c.id}
                                defaultChecked={p.codes?.includes(c.id)}
                              />
                              {c.label}
                            </label>
                          ))}
                      </div>
                    ))}
                  </fieldset>
                  <fieldset>
                    <legend>
                      Link similar proposals; preserve each original
                    </legend>
                    {proposals
                      .filter((x) => x.id !== p.id)
                      .map((x) => (
                        <label className="nh-checkbox" key={x.id}>
                          <input
                            type="checkbox"
                            name="linked_ids"
                            value={x.id}
                            defaultChecked={p.linked_ids?.includes(x.id)}
                          />
                          {x.question_id}: {x.content.statement.slice(0, 140)}
                        </label>
                      ))}
                  </fieldset>
                  <button disabled={busy}>Save coding & links</button>
                </form>
                <form
                  className="nh-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    write(
                      command("disposition", {
                        id: p.id,
                        revision: p.revision,
                        outcome: value(f, "outcome"),
                        reason: value(f, "reason"),
                      }),
                    );
                  }}
                >
                  <Field
                    label="Disposition"
                    name="outcome"
                    options={dispositions}
                    defaultValue={p.disposition?.outcome}
                  />
                  <Field
                    label="Reason and response to the author"
                    name="reason"
                    area
                    defaultValue={p.disposition?.reason}
                  />
                  <button className="nh-primary" disabled={busy}>
                    Record disposition
                  </button>
                </form>
                {p.content.type === "Practice to share" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      write(
                        command("practice", {
                          id: p.id,
                          revision: p.revision,
                          approved: !p.practice_approved,
                        }),
                      )
                    }
                  >
                    {p.practice_approved
                      ? "Remove from practice library"
                      : "Approve for practice library"}
                  </button>
                )}
                <form
                  className="nh-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    write(
                      command("moderate", {
                        id: p.id,
                        revision: p.revision,
                        reason: value(e.currentTarget, "reason"),
                      }),
                    );
                  }}
                >
                  <Field
                    label="Moderation reason (original remains under committee access)"
                    name="reason"
                  />
                  <button disabled={busy}>Restrict this contribution</button>
                </form>
              </div>
            )}
          </article>
        ))}
      </div>
      <section>
        <h2>Code catalog</h2>
        <p>
          Maintain the documented four-dimension catalog used by human
          reviewers.
        </p>
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command("code", {
                id: value(f, "id"),
                dimension: value(f, "dimension"),
                label: value(f, "label"),
              }),
            );
          }}
        >
          <Field name="id" label="Stable code identifier" />
          <Field
            name="dimension"
            label="Dimension"
            options={["Theme", "Risk", "Scope", "Suggested action"]}
          />
          <Field name="label" label="Code definition / label" />
          <button disabled={busy}>Save catalog code</button>
        </form>
      </section>
      <section>
        <h2>Question synthesis</h2>
        <label className="nh-field">
          <span>Question</span>
          <select
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          >
            {tables
              .flatMap((t) => t.questions)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id}: {q.text}
                </option>
              ))}
          </select>
        </label>
        <form
          key={question}
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command("synthesis", {
                question_id: question,
                ...Object.fromEntries(
                  ["agreement", "reservations", "minority", "gaps"].map((k) => [
                    k,
                    value(f, k),
                  ]),
                ),
              }),
            );
          }}
        >
          {[
            ["agreement", "Where there is agreement"],
            ["reservations", "Reservations"],
            ["minority", "Minority positions"],
            ["gaps", "Missing evidence"],
          ].map(([k, label]) => (
            <Field
              key={k}
              name={k}
              label={label}
              area
              defaultValue={synthesis?.[k as keyof typeof synthesis]}
            />
          ))}
          <button className="nh-primary" disabled={busy}>
            Save human synthesis
          </button>
        </form>
      </section>
      <section>
        <h2>Follow-up actions</h2>
        {feed.actions.map((a) => (
          <details key={a.id}>
            <summary>
              {a.text} · {a.owner} · {a.status}
            </summary>
            <form
              className="nh-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                write(
                  command("action", {
                    id: a.id,
                    ...Object.fromEntries(
                      ["text", "owner", "due", "status"].map((k) => [
                        k,
                        value(f, k),
                      ]),
                    ),
                  }),
                );
              }}
            >
              <Field name="text" label="Action" defaultValue={a.text} />
              <Field name="owner" label="Owner" defaultValue={a.owner} />
              <Field
                name="due"
                label="Due date"
                type="date"
                required={false}
                defaultValue={a.due}
              />
              <Field
                name="status"
                label="Status"
                options={["Open", "In progress", "Complete"]}
                defaultValue={a.status}
              />
              <button disabled={busy}>Update action</button>
            </form>
          </details>
        ))}
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command(
                "action",
                Object.fromEntries(
                  ["text", "owner", "due", "status"].map((k) => [
                    k,
                    value(f, k),
                  ]),
                ),
              ),
            );
          }}
        >
          <Field name="text" label="Action" />
          <Field name="owner" label="Owner" />
          <Field name="due" label="Due date" type="date" required={false} />
          <Field
            name="status"
            label="Status"
            options={["Open", "In progress", "Complete"]}
          />
          <button disabled={busy}>Add follow-up action</button>
        </form>
      </section>
    </>
  );
}

function DraftNorms({
  feed,
  editor,
  busy,
  write,
}: {
  feed: Feed;
  editor: boolean;
  busy: boolean;
  write: (c: Command) => Promise<boolean>;
}) {
  const [edit, setEdit] = useState<Norm | null>(null);
  return (
    <>
      <h1>Draft AI use norms</h1>
      <p>
        Draft version {feed.draft.version} · {feed.draft.status}. Each norm
        records who can act on it, the evidence behind it, and when it should be
        reviewed.
      </p>
      {feed.draft.response_summary && (
        <section className="nh-note">
          <h2>Response to the comment round</h2>
          <p>{feed.draft.response_summary}</p>
        </section>
      )}
      {!feed.norms.length && (
        <Empty>The committee has not published any norms yet.</Empty>
      )}
      {feed.norms.map((n) => (
        <article className="nh-norm" key={n.id}>
          <div className="nh-meta">
            <span>Revision {n.revision}</span>
            <span>{n.status}</span>
          </div>
          <h2>{n.content.title}</h2>
          <p className="nh-norm-text">{n.content.text}</p>
          <dl className="nh-details">
            {[
              "scope",
              "strength",
              "applies_to",
              "route",
              "review_date",
              "reservations",
            ].map((k) => (
              <div key={k}>
                <dt>{k.replaceAll("_", " ")}</dt>
                <dd>{n.content[k]}</dd>
              </div>
            ))}
          </dl>
          <p>
            <a href={n.content.existing_rule} target="_blank" rel="noreferrer">
              Existing LSC rule or guidance
            </a>{" "}
            · Checked {n.content.checked_on}
          </p>
          <h3>Evidence and traceability</h3>
          {n.contribution_ids.map((id) => {
            const p = feed.proposals.find((p) => p.id === id),
              snapshot = n.contribution_versions?.[id];
            return (
              <p key={id}>
                {snapshot
                  ? `Contribution revision ${snapshot.revision}: ${snapshot.statement}`
                  : p
                    ? `${p.question_id} · ${p.content.statement}`
                    : "Supporting contribution under controlled access"}
              </p>
            );
          })}
          {n.source_ids.map((id) => {
            const s = sources.find((s) => s.id === id);
            return (
              s && (
                <p key={id}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                </p>
              )
            );
          })}
          {editor && <button onClick={() => setEdit(n)}>Revise norm</button>}
          {n.status === "Published" && (
            <Discussion
              kind="norm"
              target={n.id}
              revision={n.revision}
              feed={feed}
              busy={busy}
              write={write}
            />
          )}
        </article>
      ))}
      {editor && (
        <>
          <section className="nh-composer">
            <h2>{edit ? "Revise norm" : "Create a norm"}</h2>
            <form
              key={edit?.id || "new"}
              className="nh-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = e.currentTarget;
                const keys = [
                  "title",
                  "text",
                  "scope",
                  "strength",
                  "route",
                  "applies_to",
                  "existing_rule",
                  "checked_on",
                  "review_date",
                  "reservations",
                ];
                if (
                  await write(
                    command("norm", {
                      id: edit?.id,
                      revision: edit?.revision,
                      content: Object.fromEntries(
                        keys.map((k) => [k, value(f, k)]),
                      ),
                      contribution_ids: new FormData(f).getAll(
                        "contribution_ids",
                      ),
                      source_ids: new FormData(f).getAll("source_ids"),
                    }),
                  )
                ) {
                  setEdit(null);
                  f.reset();
                }
              }}
            >
              <Field
                name="title"
                label="Norm title"
                defaultValue={edit?.content.title}
              />
              <Field
                name="text"
                label="Proposed norm"
                area
                defaultValue={edit?.content.text}
              />
              <Field
                name="scope"
                label="Scope"
                options={scopes}
                defaultValue={edit?.content.scope}
              />
              <Field
                name="strength"
                label="Strength"
                options={strengths}
                defaultValue={edit?.content.strength}
              />
              <Field
                name="route"
                label="Adoption or referral route"
                options={routes}
                defaultValue={edit?.content.route}
              />
              <Field
                name="applies_to"
                label="People or groups affected"
                defaultValue={edit?.content.applies_to}
              />
              <Field
                name="existing_rule"
                label="Existing LSC rule / OTS guidance URL"
                type="url"
                defaultValue={edit?.content.existing_rule}
              />
              <Field
                name="checked_on"
                label="Source checked on"
                type="date"
                defaultValue={edit?.content.checked_on}
              />
              <Field
                name="review_date"
                label="Review date"
                type="date"
                defaultValue={edit?.content.review_date}
              />
              <Field
                name="reservations"
                label="Reservations and minority views"
                area
                defaultValue={edit?.content.reservations}
              />
              <fieldset>
                <legend>Supporting contributions (at least one)</legend>
                {feed.proposals
                  .filter((p) => p.status === "Submitted")
                  .map((p) => (
                    <label className="nh-checkbox" key={p.id}>
                      <input
                        type="checkbox"
                        name="contribution_ids"
                        value={p.id}
                        defaultChecked={edit?.contribution_ids.includes(p.id)}
                      />
                      {p.question_id}: {p.content.statement.slice(0, 160)}
                    </label>
                  ))}
              </fieldset>
              <fieldset>
                <legend>Reference sources (at least one)</legend>
                {sources.map((s) => (
                  <label className="nh-checkbox" key={s.id}>
                    <input
                      type="checkbox"
                      name="source_ids"
                      value={s.id}
                      defaultChecked={edit?.source_ids.includes(s.id)}
                    />
                    {s.title}
                  </label>
                ))}
              </fieldset>
              <button className="nh-primary" disabled={busy}>
                Save norm revision
              </button>
              {edit && (
                <button type="button" onClick={() => setEdit(null)}>
                  Cancel revision
                </button>
              )}
            </form>
          </section>
          <section>
            <h2>Publish a draft & response summary</h2>
            <form
              className="nh-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                write(
                  command("draft", {
                    status: value(f, "status"),
                    response_summary: value(f, "response_summary"),
                  }),
                );
              }}
            >
              <Field
                name="status"
                label="Draft status"
                options={["Working", "Published", "Final"]}
                defaultValue={feed.draft.status}
              />
              <Field
                name="response_summary"
                label="Committee response to draft comments"
                area
                required={false}
                defaultValue={feed.draft.response_summary}
              />
              <p>
                Publish for the comment round. Publish the response summary and
                close the round before marking the draft final.
              </p>
              <button className="nh-primary" disabled={busy}>
                Save draft version
              </button>
            </form>
          </section>
        </>
      )}
    </>
  );
}

function Heard({ feed, editor }: { feed: Feed; editor: boolean }) {
  const proposals = feed.proposals.filter((p) => p.status === "Submitted"),
    individual = proposals.filter((p) => p.content.collective !== "true"),
    collective = proposals.filter((p) => p.content.collective === "true");
  const participants = new Set(individual.map((p) => p.author_id));
  const threshold = Math.max(5, feed.threshold);
  const countLabel = (count: number) => participants.size >= threshold && count >= threshold ? count : "Suppressed";
  const typeCounts = suppressedDistribution(Object.fromEntries(contributionTypes.map((t) => [t, proposals.filter((p) => p.content.type === t).length])), threshold);
  const dispositionCounts = suppressedDistribution(Object.fromEntries(dispositions.map((d) => [d, proposals.filter((p) => p.disposition?.outcome === d).length])), threshold);
  return (
    <>
      <h1>What we heard, what we did</h1>
      <p>
        Participation describes those who contributed. It does not establish
        that respondents represent North Harris.
      </p>
      <div className="nh-overview-strip">
        <div>
          <strong>{countLabel(participants.size)}</strong>
          <span>Individual contributors</span>
        </div>
        <div>
          <strong>{countLabel(individual.length)}</strong>
          <span>Individual contributions</span>
        </div>
        <div>
          <strong>{countLabel(collective.length)}</strong>
          <span>Collective proposals</span>
        </div>
        <div>
          <strong>{countLabel(proposals.filter((p) => p.disposition).length)}</strong>
          <span>Recorded dispositions</span>
        </div>
      </div>
      <p>
        {participants.size >= threshold && feed.rosterCount && feed.rosterCount - participants.size >= threshold
          ? `${participants.size} of ${feed.rosterCount} enrolled participants contributed (${Math.round((participants.size / feed.rosterCount) * 100)}%).`
          : "Counts shown; an enrolled-participant denominator is not available."}
      </p>
      <h2>Proposal types</h2>
      <div className="nh-report-table">
        {contributionTypes.map((t) => (
          <div key={t}>
            <span>{t}</span>
            <strong>
              {participants.size >= threshold ? typeCounts[t] ?? "Suppressed" : "Suppressed"}
            </strong>
          </div>
        ))}
      </div>
      <h2>Question coverage</h2>
      <div className="nh-report-table">
        {tables.map((t) => (
          <div key={t.id}>
            <span>{t.title}</span>
            <strong>
              {participants.size < threshold ? "Suppressed" : (
                t.questions.filter((q) =>
                  proposals.some((p) => p.question_id === q.id),
                ).length
              )}{" "}
              / 4 questions
            </strong>
          </div>
        ))}
      </div>
      <h2>Employment category coverage</h2>
      <div className="nh-report-table">
        {categories.map((category) => {
          const count = feed.participationByCategory?.[category] ?? new Set(
            individual
              .filter(
                (p) =>
                  feed.profiles.find((u) => u.id === p.author_id)?.category ===
                  category,
              )
              .map((p) => p.author_id),
          ).size;
          return (
            <div key={category}>
              <span>{category}</span>
              <strong>
                {(!feed.participationByCategory || feed.participationByCategory[category] === null || count < threshold)
                  ? `Suppressed (below ${feed.threshold})`
                  : count}
              </strong>
            </div>
          );
        })}
      </div>
      <h2>Dispositions</h2>
      <div className="nh-report-table">
        {dispositions.map((d) => (
          <div key={d}>
            <span>{d}</span>
            <strong>
              {participants.size >= threshold ? dispositionCounts[d] ?? "Suppressed" : "Suppressed"}
            </strong>
          </div>
        ))}
      </div>
      <h2>Human synthesis</h2>
      {feed.syntheses.length ? (
        feed.syntheses.map((s) => (
          <article key={s.question_id} className="nh-norm">
            <h3>{s.question_id}</h3>
            <dl className="nh-details">
              {[
                ["Agreement", s.agreement],
                ["Reservations", s.reservations],
                ["Minority views", s.minority],
                ["Missing evidence", s.gaps],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))
      ) : (
        <Empty>
          Synthesis will appear as the committee reviews contributions.
        </Empty>
      )}
      <h2>Baseline & closing pulse</h2>
      <p>
        Small groups and response categories below {feed.threshold} are
        suppressed. No named pulse records are displayed or exported.
      </p>
      <pre className="nh-pulse-result">
        {JSON.stringify(feed.pulse, null, 2)}
      </pre>
      <p className="nh-muted">
        National context: College Board surveyed over 3,000 faculty in summer
        2025; AAC&U / Elon surveyed 1,057 faculty in late 2025 and described its
        survey as non-scientific. These populations are not North Harris
        comparison groups.
      </p>
      {editor && <p>Use the administrator-only Export CSV or Export PDF buttons in the header. Downloaded material is confidential and must be handled securely.</p>}
    </>
  );
}

function SourcesPrimer() {
  const [slide, setSlide] = useState(0),
    [present, setPresent] = useState(false);
  return (
    <>
      <h1>Sources & PRIMER</h1>
      <p>
        Institutional guidance sets the starting point. External examples and
        national research inform discussion.
      </p>
      <div className="nh-library">
        {sources.map((s) => (
          <a href={s.url} target="_blank" rel="noreferrer" key={s.id}>
            <small>{s.kind}</small>
            <strong>{s.title}</strong>
            <span>Read source ↗</span>
          </a>
        ))}
      </div>
      <section className={present ? "nh-primer nh-present" : "nh-primer"}>
        <p>PRIMER framework by Kayla Almaguer</p>
        <h2>Keep the thinking visible.</h2>
        <div className="nh-primer-slide">
          <span>{primer[slide][0]}</span>
          <h3>{primer[slide][1]}</h3>
          <p>{primer[slide][2]}</p>
        </div>
        <div className="nh-actions">
          <button onClick={() => setSlide((slide + 5) % 6)}>Previous</button>
          <span>{slide + 1} / 6</span>
          <button onClick={() => setSlide((slide + 1) % 6)}>Next</button>
          <button onClick={() => setPresent(!present)}>
            {present ? "Exit presentation" : "Present PRIMER"}
          </button>
        </div>
        <div className="nh-print-primer">
          {primer.map(([letter, title, text], i) => (
            <div key={i}>
              <h3>
                {letter}: {title}
              </h3>
              <p>{text}</p>
            </div>
          ))}
          <p>PRIMER framework author: Kayla Almaguer</p>
        </div>
      </section>
    </>
  );
}

function Admin({
  feed,
  busy,
  write,
}: {
  feed: Feed;
  busy: boolean;
  write: (c: Command) => Promise<boolean>;
}) {
  return (
    <>
      <h1>Consultation administration</h1>
      <p>
        Verified Lone Star emails enroll automatically. Administrators can
        manage enrolled participants, roles, facilitated sessions, and round
        state.
      </p>
      <section>
        <h2>Round management</h2>
        {feed.rounds.map((r) => (
          <p key={r.id}>
            <strong>{r.name}</strong> · {r.phase} · {r.open ? "Open" : "Closed"}
          </p>
        ))}
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command("round", {
                name: value(f, "name"),
                phase: value(f, "phase"),
                open: value(f, "state") === "Open",
              }),
            );
          }}
        >
          <Field label="New round name" name="name" />
          <Field
            label="Phase"
            name="phase"
            options={["Collect", "Synthesize", "Comment", "Closed"]}
          />
          <Field label="State" name="state" options={["Open", "Closed"]} />
          <button disabled={busy}>Close existing round & create round</button>
        </form>
      </section>
      <section>
        <h2>Enrolled participants</h2>
        <p>
          Verified employee @lonestar.edu accounts enroll
          automatically after sign-in. Email addresses are used for access
          checks and are not displayed to members.
        </p>
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            write(
              command("roster", { email: value(e.currentTarget, "email") }),
            );
          }}
        >
          <Field label="Institutional email" name="email" type="email" />
          <button disabled={busy}>Add or reactivate participant</button>
        </form>
      </section>
      <section>
        <h2>Assign a consultation role</h2>
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command("role", {
                user_id: value(f, "user_id"),
                role: value(f, "role"),
                operation: value(f, "operation"),
              }),
            );
          }}
        >
          <label className="nh-field">
            <span>Active member</span>
            <select name="user_id">
              {feed.profiles.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}: {p.roles.join(", ")}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Role"
            name="role"
            options={[
              "Participant",
              "Facilitator",
            ]}
          />
          <Field
            label="Operation"
            name="operation"
            options={["Assign", "Revoke"]}
          />
          <button disabled={busy}>Update role</button>
        </form>
      </section>
      <section>
        <h2>Facilitated session</h2>
        {feed.sessions.map((s) => (
          <p key={s.id}>
            {s.name} · {s.date}
          </p>
        ))}
        <form
          className="nh-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            write(
              command("session", {
                name: value(f, "name"),
                date: value(f, "date"),
              }),
            );
          }}
        >
          <Field label="Session name" name="name" />
          <Field label="Session date" name="date" type="date" />
          <button disabled={busy}>Create session</button>
        </form>
      </section>
    </>
  );
}
