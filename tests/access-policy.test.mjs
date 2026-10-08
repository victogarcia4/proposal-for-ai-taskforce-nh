import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_EMAIL, accessRoles, authorizeCommand, assertEligibleUser, requireAdmin } from "../src/lib/access-policy.mjs";
import { validateCommand } from "../src/lib/validation.mjs";
import { PRIVACY_NOTICE_VERSION } from "../src/lib/privacy.mjs";
import { createConsultationHandler } from "../netlify/functions/consultation.mjs";
import { createExportHandler } from "../netlify/functions/export.mjs";
import { materialCsv, materialPdf } from "../src/lib/material-export.mjs";
const employee = { id: "employee", email: "staff@lonestar.edu", email_confirmed_at: "2026-10-07" };
const admin = { id: "admin", email: ADMIN_EMAIL, email_confirmed_at: "2026-10-07" };
test("only the verified designated identity grants administrator permissions", () => {
  assert.deepEqual(accessRoles(employee, ["Administrator", "Committee", "Facilitator"]), ["Participant", "Facilitator"]);
  assert.deepEqual(accessRoles(admin), ["Participant", "Administrator"]);
  for (const user of [employee, { ...admin, email_confirmed_at: null }, { ...employee, user_metadata: { role: "Administrator", email: ADMIN_EMAIL } }]) assert.throws(() => requireAdmin(user), /designated/);
  assert.doesNotThrow(() => requireAdmin(admin));
  assert.throws(() => authorizeCommand(employee, ["Administrator", "Committee"], { action: "moderate" }), /designated/);
  assert.throws(() => authorizeCommand(admin, ["Administrator"], { action: "role", role: "Administrator", operation: "Assign", user_id: "other" }), /cannot be delegated/);
});
test("students, external domains, and unverified employee identities are rejected", () => {
  for (const email of ["student@my.lonestar.edu", "outsider@gmail.com", "person@lonestar.edu.evil.test"]) assert.throws(() => assertEligibleUser({ ...employee, email }), /Students/);
  assert.throws(() => assertEligibleUser({ ...employee, email_confirmed_at: null }), /verified/);
  assert.doesNotThrow(() => assertEligibleUser(employee));
  assert.doesNotThrow(() => assertEligibleUser(admin));
  const profile = { action: "profile", request_id: crypto.randomUUID(), privacy_notice_version: PRIVACY_NOTICE_VERSION, name: "Employee", category: "Staff", unit: "", discipline: "", years: "", employee_confirmed: true };
  assert.doesNotThrow(() => validateCommand(profile));
  assert.throws(() => validateCommand({ ...profile, employee_confirmed: false }), /Confirm/);
  assert.throws(() => validateCommand({ ...profile, category: "Student" }), /category/);
});
function fixture(user) {
  const touched = [], writes = [];
  const adminAccess = user.id === admin.id;
  const records = {
    nh_contributions: [{ id: "p1", consultation_id: "north-harris-ai-norms", author_id: employee.id, question_id: "T1Q1", status: "Submitted", revision: 2, content: { statement: "Current opinion" } }, { id: "p2", author_id: "other", status: "Draft", revision: 1, content: { statement: "Saved draft" } }],
    nh_revisions: [{ contribution_id: "p1", revision: 1, content: { statement: "Earlier opinion" } }],
    nh_profiles: [{ id: employee.id, name: "Staff name", category: "Staff", unit: "", discipline: "", years: "" }, { id: admin.id, name: "Admin name", category: "Administrator" }],
    nh_memberships: [{ user_id: employee.id, active: true }, { user_id: admin.id, active: true }],
    nh_comments: [{ id: "c1", target_id: "p1", author_id: employee.id, revision: 1, body: "Earlier comment" }, { id: "c2", target_id: "p1", author_id: employee.id, revision: 2, body: "Current comment" }],
  };
  const db = { from(table) {
    touched.push(table); let rows = records[table] || [];
    const q = { select() { return q; }, order() { return q; }, eq(key, val) { rows = rows.filter((r) => !(key in r) || r[key] === val); return q; }, in(key, values) { rows = rows.filter((r) => values.includes(r[key])); return q; }, range(start, end) { return Promise.resolve({ data: rows.slice(start, end + 1) }); }, maybeSingle() { return Promise.resolve({ data: rows[0] }); } };
    return q;
  }, rpc(name) { writes.push(name); return Promise.resolve({ data: { ok: true } }); } };
  const ctx = { db, user, institutionalEmail: user.email, admin: adminAccess, editor: adminAccess, roles: accessRoles(user), consultation: { enabled: true, threshold: 5, draft: { status: "Working", version: 1 } } };
  return { ctx, touched, writes };
}
test("feed exposes saved opinions and full histories to admin, but only current own edits to participants", async () => {
  for (const user of [employee, admin]) {
    const f = fixture(user);
    const response = await createConsultationHandler(async () => f.ctx)(new Request("https://app.test/api/consultation"));
    assert.equal(response.status, 200);
    const feed = await response.json();
    if (user === admin) { assert.equal(feed.proposals.length, 2); assert.equal(feed.proposals[0].history.length, 1); assert.equal(feed.comments.length, 2); }
    else { assert.equal(feed.proposals.length, 1); assert.equal(feed.proposals[0].history.length, 0); assert(!f.touched.includes("nh_revisions")); assert.deepEqual(feed.comments.map((c) => c.body), ["Current comment"]); }
  }
});
test("direct administrative writes from other accounts are rejected before the RPC", async () => {
  const f = fixture(employee);
  const response = await createConsultationHandler(async () => f.ctx)(new Request("https://app.test/api/consultation", { method: "POST", body: JSON.stringify({ action: "moderate", reason: "Review", request_id: crypto.randomUUID() }) }));
  assert.equal(response.status, 403); assert.equal(f.writes.length, 0);
});
test("CSV and PDF endpoints reject participants and unverified admins before reading any material", async () => {
  for (const user of [employee, { ...admin, email_confirmed_at: null }]) {
    let reads = 0;
    const handler = createExportHandler(async () => ({ user }), async () => { reads++; throw new Error("must not read"); });
    for (const format of ["csv", "pdf"]) {
      const response = await handler(new Request(`https://app.test/api/export?format=${format}`));
      assert.equal(response.status, 403); assert.equal(reads, 0); assert.match(response.headers.get("Cache-Control"), /no-store/);
    }
  }
});
test("admin downloads contain opinions and history in valid CSV and multipage PDF", async () => {
  const f = fixture(admin), getFeed = createConsultationHandler(async () => f.ctx);
  const handler = createExportHandler(async () => f.ctx, getFeed);
  const csv = await handler(new Request("https://app.test/api/export?format=csv"));
  assert.equal(csv.status, 200); assert.match(await csv.text(), /Current opinion[\s\S]*Earlier opinion[\s\S]*Saved draft/);
  const pdf = await handler(new Request("https://app.test/api/export?format=pdf"));
  assert.equal(pdf.headers.get("Content-Type"), "application/pdf");
  assert.match(await pdf.text(), /^%PDF-1.4/);
  assert.match(materialCsv([{ content: '=HYPERLINK("evil")' }]), /'=HYPERLINK/);
  const bytes = materialPdf(Array.from({ length: 100 }, (_, i) => ({ kind: "Opinion", id: i, content: "Opinión española" })));
  assert.match(bytes.toString("latin1"), /\/Count [2-9]/);
  assert.match(bytes.toString("latin1"), /Opinión española/);
  const text = bytes.toString("latin1"), offset = Number(text.match(/startxref\n(\d+)/)[1]);
  assert.equal(text.slice(offset, offset + 4), "xref");
});
