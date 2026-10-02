import { useEffect, useRef, useState } from "react";
import type { Attachment } from "../lib/consultation";
import { api, attachmentRequest } from "../lib/supabase";
export function Attachments({
  proposalId,
  canUpload,
  demo,
}: {
  proposalId: string;
  canUpload: boolean;
  demo: boolean;
}) {
  const [items, setItems] = useState<Attachment[]>([]),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const files = useRef(new Map<string, File>()),
    retryId = useRef(crypto.randomUUID());
  async function load() {
    if (!demo) {
      try {
        const data = await api<{ attachments: Attachment[] }>();
        setItems(
          data.attachments.filter((a) => a.contribution_id === proposalId),
        );
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }
  useEffect(() => {
    load();
  }, [proposalId, demo]);
  async function download(a: Attachment) {
    try {
      const blob = demo
        ? files.current.get(a.id)
        : await attachmentRequest("GET", undefined, a.id);
      if (!blob)
        throw new Error("Demo attachment is no longer in this session.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = a.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section>
      <h3>Supporting attachments</h3>
      {items.map((a) => (
        <p key={a.id}>
          <button onClick={() => download(a)}>{a.name}</button> {a.description}{" "}
          · {Math.ceil(a.bytes / 1024)} KB
        </p>
      ))}
      {canUpload && (
        <form
          className="nh-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              data = new FormData(form),
              file = data.get("file");
            if (!(file instanceof File) || file.size > 5242880) {
              setError("Choose a file up to 5 MB.");
              return;
            }
            setBusy(true);
            setError("");
            setStatus("Uploading…");
            try {
              if (demo) {
                const a = {
                  id: retryId.current,
                  contribution_id: proposalId,
                  name: file.name,
                  description: String(data.get("description")),
                  bytes: file.size,
                };
                files.current.set(a.id, file);
                setItems((x) => x.filter((i) => i.id !== a.id).concat(a));
                setStatus("Attachment held in this demo session.");
              } else {
                data.set("contribution_id", proposalId);
                data.set("request_id", retryId.current);
                await attachmentRequest("POST", data);
                await load();
                setStatus("Private attachment saved.");
              }
              retryId.current = crypto.randomUUID();
              form.reset();
            } catch (e) {
              setError((e as Error).message);
              setStatus("Upload failed; choose Save attachment to retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="nh-field">
            <span>Optional attachment (up to 5 MB)</span>
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
            />
          </label>
          <label className="nh-field">
            <span>Short description</span>
            <input name="description" required maxLength={500} />
          </label>
          <button disabled={busy}>Save attachment</button>
        </form>
      )}
      {error && (
        <p role="alert" className="nh-error">
          {error}
        </p>
      )}
      <p role="status">{status}</p>
    </section>
  );
}
