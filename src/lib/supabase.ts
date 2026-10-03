import { createClient } from "@supabase/supabase-js";
import { PROJECT_URL, type Command, type Feed } from "./consultation";

// Publishable keys identify the public client; they are not server credentials.
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_gxhWkn5KGcGcpjjdHQUmGA_eMjKWk4V";
export const supabase = createClient(PROJECT_URL, publishableKey, {
  // This is a browser-only client. Email-code verification creates the session
  // directly, while URL detection keeps the client compatible with Supabase's
  // hosted authentication callbacks.
  auth: { flowType: "implicit", persistSession: true, detectSessionInUrl: true },
});
export async function api<T = Feed>(
  method = "GET",
  body?: Command,
): Promise<T> {
  if (!supabase) throw new Error("Supabase publishable key is not configured.");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    throw new Error("Please sign in with your institutional account.");
  const response = await fetch("/api/consultation", {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch {
    throw new Error(
      "The local preview is missing its API service. Open the deployed Netlify app, or start the preview with Netlify local emulation.",
    );
  }
  if (!response.ok) {
    const error = (data as { error?: string }).error;
    throw new Error(error || "The request could not be completed.");
  }
  return data;
}
export async function attachmentRequest(
  method: string,
  body?: FormData,
  id?: string,
) {
  const session = (await supabase?.auth.getSession())?.data.session;
  if (!session) throw new Error("Sign in before accessing attachments.");
  const response = await fetch(
    `/api/attachment${id ? `?id=${encodeURIComponent(id)}` : ""}`,
    {
      method,
      headers: { Authorization: `Bearer ${session.access_token}` },
      body,
    },
  );
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Attachment request failed.");
  }
  return method === "GET" ? response.blob() : response.json();
}
