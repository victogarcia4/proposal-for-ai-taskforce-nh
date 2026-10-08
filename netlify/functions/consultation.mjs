import {
  context,
  checked,
  fail,
  validateCommand,
  consultationId,
  summarizePulse,
  readAll,
} from "./_consultation.mjs";
import { minimizeProfile, suppressedDistribution } from "../../src/lib/privacy.mjs";
import { authorizeCommand, EMPLOYEE_CATEGORIES } from "../../src/lib/access-policy.mjs";
const privateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
};

export function createConsultationHandler(getContext = context) {
 return async function handler(request) {
  try {
    const ctx = await getContext(request);
    const { db, user, institutionalEmail, roles, editor, admin, consultation } =
      ctx;
    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > 60000) fail("Request is too large.", 413);
      const body = JSON.parse(raw);
      validateCommand(body);
      authorizeCommand(user, roles, body);
      if (!admin && !consultation.enabled && !["profile", "round"].includes(body.action))
        fail("Live participation is awaiting administrator activation.", 403);
      if (body.action !== "profile") {
        const profile = await checked(
          await db
            .from("nh_profiles")
            .select("name,category")
            .eq("id", user.id)
            .maybeSingle(),
        );
        if (!profile?.name?.trim() || !EMPLOYEE_CATEGORIES.includes(profile.category))
          fail(
            "Complete your name and institutional email profile before participating.",
            403,
          );
      }
      const saved = await checked(
        await db.rpc("nh_write", { actor: user.id, payload: body }),
      );
      if (admin && body.action === "round") await checked(await db.from("nh_consultations").update({ enabled: body.open }).eq("id", consultationId));
      const refreshed = await db.rpc("nh_refresh_reporting");
      return Response.json(
        { ...saved, reporting_refreshed: !refreshed.error },
        { headers: privateHeaders },
      );
    }
    if (request.method !== "GET") fail("Method not allowed.", 405);
    const query = (table, columns = "*") => {
      let q = db
        .from(table)
        .select(columns)
        .eq("consultation_id", consultationId);
      const keys =
        table === "nh_positions"
          ? ["author_id", "target_id", "revision", "kind"]
          : table === "nh_syntheses"
            ? ["question_id"]
            : table === "nh_memberships"
              ? ["user_id"]
              : table === "nh_roles"
                ? ["user_id", "role"]
                : ["id"];
      if (["nh_contributions", "nh_rounds"].includes(table))
        q = q.order("created_at", { ascending: false });
      for (const key of keys) q = q.order(key);
      return q;
    };
    const read = readAll;
    const [
      proposals,
      norms,
      comments,
      positions,
      rounds,
      syntheses,
      actions,
      codes,
      sessions,
      notices,
      profiles,
      members,
      pulse,
      roster,
      attachments,
    ] = await Promise.all([
      read(query("nh_contributions")),
      read(query("nh_norms")),
      read(query("nh_comments")),
      read(query("nh_positions")),
      read(query("nh_rounds")),
      read(query("nh_syntheses")),
      read(query("nh_actions")),
      read(db.from("nh_codes").select("*").order("id")),
      read(query("nh_sessions")),
      read(query("nh_notifications").eq("user_id", user.id)),
      read(db.from("nh_profiles").select("id,name,category,unit,discipline,years").order("id")),
      read(query("nh_memberships").eq("active", true)),
      read(query("nh_pulse", "stage,answers")),
      read(query("nh_roster", "id").eq("active", true)),
      Promise.resolve([]),
    ]);
    const allowed = proposals.filter(
      (p) =>
        p.author_id === user.id ||
        p.status === "Submitted" ||
        admin,
    );
    const visibleNorms = norms.filter((n) => editor || n.status !== "Working");
    const targets = new Set([
      ...allowed.filter((p) => p.status !== "Draft").map((p) => p.id),
      ...visibleNorms.map((n) => n.id),
    ]);
    const roleRecords = admin ? await read(query("nh_roles")) : [];
    const membershipIds = new Set(members.map((m) => m.user_id));
    const authorIds = new Set([user.id, ...allowed.map((p) => p.author_id), ...comments.filter((c) => targets.has(c.target_id)).map((c) => c.author_id), ...positions.filter((c) => targets.has(c.target_id)).map((c) => c.author_id)]);
    const safeProfiles = profiles
      .filter((p) => membershipIds.has(p.id) && (admin || authorIds.has(p.id)))
      .map((p) => ({
        ...minimizeProfile(p, user.id, admin),
        roles:
          p.id === user.id
            ? roles
            : admin
              ? roleRecords.filter((r) => r.user_id === p.id).map((r) => r.role)
              : [],
      }));
    const history = [];
    const historyAllowed = admin ? allowed : [];
    for (let start = 0; start < historyAllowed.length; start += 100)
      history.push(
        ...(await read(
          db
            .from("nh_revisions")
            .select("contribution_id,revision,content,created_at")
            .in(
              "contribution_id",
              historyAllowed.slice(start, start + 100).map((p) => p.id),
            )
            .order("contribution_id")
            .order("revision"),
        )),
      );
    const allowedIds = new Set(allowed.map((p) => p.id));
    const ownProfile = safeProfiles.find((p) => p.id === user.id) || {
      id: user.id,
      name: "",
      category: "",
      unit: "",
      discipline: "Not a teaching role",
      years: "Prefer not to say",
      roles,
    };
    return Response.json(
      {
        profile: { ...ownProfile, institutional_email: institutionalEmail },
        profiles: safeProfiles,
        participationByCategory: suppressedDistribution(Object.fromEntries(["Full-time faculty", "Adjunct faculty", "Staff", "Administrator", "Prefer not to say"].map((category) => [category, new Set(allowed.filter((p) => p.status === "Submitted" && p.content.collective !== "true" && profiles.find((u) => u.id === p.author_id)?.category === category).map((p) => p.author_id)).size])), consultation.threshold),
        attachments: attachments.filter((a) =>
          allowedIds.has(a.contribution_id),
        ),
        proposals: allowed.map((p) => ({
          ...p,
          history: history.filter((h) => h.contribution_id === p.id),
        })),
        norms: visibleNorms.map((n) => editor ? n : { ...n, contribution_versions: undefined, history: undefined }),
        comments: [
          ...comments.filter((c) => targets.has(c.target_id) && (editor || c.revision === [...allowed, ...visibleNorms].find((p) => p.id === c.target_id)?.revision)),
          ...positions
            .filter((c) => targets.has(c.target_id) && (editor || c.revision === [...allowed, ...visibleNorms].find((p) => p.id === c.target_id)?.revision))
            .map((p) => ({
              ...p,
              id: `${p.author_id}-${p.target_id}-${p.revision}`,
              created_at: p.updated_at,
            })),
        ],
        rounds,
        syntheses,
        actions,
        codeCatalog: codes,
        sessions,
        notifications: notices,
        pulse: summarizePulse(pulse, consultation.threshold),
        rosterCount: roster.length || null,
        threshold: consultation.threshold,
        draft: editor || consultation.draft?.status !== "Working" ? consultation.draft : { version: consultation.draft.version, status: "Working", response_summary: "" },
      },
      { headers: privateHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Request failed." },
      { status: error.status || 500, headers: privateHeaders },
    );
  }
 };
}
export default createConsultationHandler();
