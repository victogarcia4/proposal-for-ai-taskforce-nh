import { createClient } from "@supabase/supabase-js";
import { isInstitutionalEmail } from "../../src/lib/validation.mjs";
export const consultationId = "north-harris-ai-norms";
export function clients() {
  const url =
    process.env.SUPABASE_URL || "https://tpmvahgtmxtgshedtusy.supabase.co";
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!key || !secret)
    throw Object.assign(
      new Error("The consultation database is awaiting server configuration."),
      { status: 503 },
    );
  return {
    auth: createClient(url, key, { auth: { persistSession: false } }),
    db: createClient(url, secret, { auth: { persistSession: false } }),
  };
}
export function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
export async function checked(result) {
  if (result.error)
    throw Object.assign(new Error(result.error.message), {
      status:
        result.error.message.includes("Conflict") ||
        result.error.message.includes("changed")
          ? 409
          : 400,
    });
  return result.data;
}
// PostgREST limits each response. Never silently truncate participation totals.
export async function readAll(query) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await checked(await query.range(offset, offset + 999));
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}
export async function context(request) {
  const { auth, db } = clients();
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!token) fail("Sign-in required.", 401);
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) fail("Your session expired. Sign in again.", 401);
  const user = data.user;
  const institutionalEmail = user.email?.trim().toLowerCase() || "";
  if (!isInstitutionalEmail(institutionalEmail))
    fail(
      "Use a Microsoft account with a @lonestar.edu or @my.lonestar.edu email address.",
      403,
    );
  const tenant = process.env.LSC_ENTRA_TENANT_ID;
  // app_metadata is controlled by an administrator; user_metadata is never trusted.
  if (
    !tenant ||
    user.app_metadata?.institutional_tenant_id !== tenant ||
    !user.identities?.some((identity) => identity.provider === "azure")
  )
    fail("Institutional sign-in has not been verified for this account.", 403);
  const roster = await checked(
    await db
      .from("nh_roster")
      .select("id")
      .eq("consultation_id", consultationId)
      .eq("email", institutionalEmail)
      .eq("active", true)
      .maybeSingle(),
  );
  if (!roster)
    fail("Your account is not on the consultation invitation roster.", 403);
  const member = await checked(
    await db
      .from("nh_memberships")
      .select("active")
      .eq("consultation_id", consultationId)
      .eq("user_id", user.id)
      .maybeSingle(),
  );
  if (!member) {
    await checked(
      await db
        .from("nh_memberships")
        .upsert(
          { consultation_id: consultationId, user_id: user.id, active: true },
          { onConflict: "consultation_id,user_id", ignoreDuplicates: true },
        ),
    );
    await checked(
      await db.from("nh_roles").upsert(
        {
          consultation_id: consultationId,
          user_id: user.id,
          role: "Participant",
        },
        {
          onConflict: "consultation_id,user_id,role",
          ignoreDuplicates: true,
        },
      ),
    );
  } else if (!member.active)
    fail("Your consultation membership is inactive.", 403);
  const roleRows = await checked(
    await db
      .from("nh_roles")
      .select("role")
      .eq("consultation_id", consultationId)
      .eq("user_id", user.id),
  );
  const roles = roleRows.map((row) => row.role);
  const consultation = await checked(
    await db
      .from("nh_consultations")
      .select("*")
      .eq("id", consultationId)
      .single(),
  );
  const admin = roles.includes("Administrator"),
    editor = admin || roles.includes("Committee");
  return { db, user, institutionalEmail, roles, admin, editor, consultation };
}
export {
  validateCommand,
  isInstitutionalEmail,
} from "../../src/lib/validation.mjs";
export function summarizePulse(rows, threshold) {
  const output = {};
  for (const stage of ["Baseline", "Closing"]) {
    const group = rows.filter((r) => r.stage === stage);
    if (group.length < threshold) {
      output[stage] = { suppressed: true, threshold };
      continue;
    }
    const answers = {};
    for (const key of [
      "sentiment",
      "challenge",
      "confidence",
      "experience",
      "concerns",
      "guidance",
    ]) {
      const counts = {};
      for (const r of group)
        counts[r.answers[key]] = (counts[r.answers[key]] || 0) + 1;
      // Hide the dimension if totals could reveal a small cell by subtraction.
      answers[key] = Object.values(counts).some((count) => count < threshold)
        ? { suppressed: true }
        : counts;
    }
    output[stage] = { count: group.length, answers };
  }
  return output;
}
