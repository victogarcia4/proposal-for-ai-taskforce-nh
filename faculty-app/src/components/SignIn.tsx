import { useState } from "react";
import { adminSignIn, DEMO, sendCode, verifyCode } from "../data";

export function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (admin)
    return (
      <form className="card" onSubmit={(e) => { e.preventDefault(); run(async () => { await adminSignIn(email, password); onDone(); }); }}>
        <h2>Administrator sign-in</h2>
        <label className="field">Administrator email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field">Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button className="ghost" type="button" onClick={() => setAdmin(false)}>Back</button>
          <button disabled={busy}>Sign in</button>
        </div>
      </form>
    );

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          if (!sent) {
            await sendCode(email);
            setSent(true);
          } else {
            await verifyCode(email, code);
            onDone();
          }
        });
      }}
    >
      <h2>Faculty sign-in</h2>
      <p>About 15 minutes: a short survey on how you use AI, then 10 quick questions with ready-made options. Write more only if you want to.</p>
      <label className="field">
        Lone Star email
        <input type="email" required placeholder="name@lonestar.edu" value={email} disabled={sent} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {sent && (
        <label className="field">
          Code from your email
          <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
      )}
      {DEMO && <p className="note">Demo mode: no email is sent and nothing is stored. Enter any 6-digit code.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button className="ghost" type="button" onClick={() => setAdmin(true)}>Administrator</button>
        <button disabled={busy}>{sent ? "Sign in" : "Send me a code"}</button>
      </div>
    </form>
  );
}
