import { createClient } from "@supabase/supabase-js";
import { PROJECT_URL, type Command, type Feed } from "./consultation";

// Publishable keys identify the public client; they are not server credentials.
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_gxhWkn5KGcGcpjjdHQUmGA_eMjKWk4V";
export const supabase = createClient(PROJECT_URL, publishableKey, {
  // This is a browser-only client. The standard Supabase magic-link template
  // returns an implicit-flow session in the URL fragment.
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
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "The request could not be completed.");
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
