import {
  context,
  checked,
  fail,
  validateCommand,
  consultationId,
  summarizePulse,
  readAll,
} from "./_consultation.mjs";
const privateHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
};

export default async function handler(request) {
  try {
    const ctx = await context(request);
    const { db, user, roles, editor, admin, consultation } = ctx;
    if (request.method === "POST") {
      if (!consultation.enabled)
        fail("Live participation is awaiting administrator activation.", 403);
      const raw = await request.text();
      if (raw.length > 60000) fail("Request is too large.", 413);
      const body = JSON.parse(raw);
      validateCommand(body);
      const saved = await checked(
        await db.rpc("nh_write", { actor: user.id, payload: body }),
      );
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
      read(db.from("nh_profiles").select("*").order("id")),
      read(query("nh_memberships").eq("active", true)),
      read(query("nh_pulse", "stage,answers")),
      read(query("nh_roster", "id").eq("active", true)),
      read(
        query("nh_attachments", "id,contribution_id,name,description,bytes"),
      ),
    ]);
    const allowed = proposals.filter(
      (p) =>
        p.author_id === user.id ||
        p.status === "Submitted" ||
        (editor && p.status === "Moderated"),
    );
    const visibleNorms = norms.filter((n) => editor || n.status !== "Working");
    const targets = new Set([
      ...allowed.filter((p) => p.status !== "Draft").map((p) => p.id),
      ...visibleNorms.map((n) => n.id),
    ]);
    const roleRecords = admin ? await read(query("nh_roles")) : [];
    const membershipIds = new Set(members.map((m) => m.user_id));
    const safeProfiles = profiles
      .filter((p) => membershipIds.has(p.id))
      .map((p) => ({
        ...p,
        roles:
          p.id === user.id
            ? roles
            : admin
              ? roleRecords.filter((r) => r.user_id === p.id).map((r) => r.role)
              : [],
      }));
    const history = [];
    for (let start = 0; start < allowed.length; start += 100)
      history.push(
        ...(await read(
          db
            .from("nh_revisions")
            .select("contribution_id,revision,content,created_at")
            .in(
              "contribution_id",
              allowed.slice(start, start + 100).map((p) => p.id),
            )
            .order("contribution_id")
            .order("revision"),
        )),
      );
    const allowedIds = new Set(allowed.map((p) => p.id));
    return Response.json(
      {
        profile: safeProfiles.find((p) => p.id === user.id) || {
          id: user.id,
          name: "",
          category: "Staff",
          unit: "",
          discipline: "Not a teaching role",
          years: "Prefer not to say",
          roles,
        },
        profiles: safeProfiles,
        attachments: attachments.filter((a) =>
          allowedIds.has(a.contribution_id),
        ),
        proposals: allowed.map((p) => ({
          ...p,
          history: history.filter((h) => h.contribution_id === p.id),
        })),
        norms: visibleNorms,
        comments: [
          ...comments.filter((c) => targets.has(c.target_id)),
          ...positions
            .filter((c) => targets.has(c.target_id))
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
        draft: consultation.draft,
      },
      { headers: privateHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Request failed." },
      { status: error.status || 500, headers: privateHeaders },
    );
  }
}
