import test from "node:test";
import assert from "node:assert/strict";
import { minimizeProfile, suppressedDistribution, PRIVACY_NOTICE_VERSION } from "../src/lib/privacy.mjs";
import { validateCommand } from "../src/lib/validation.mjs";
import attachment from "../netlify/functions/attachment.mjs";
import consultation from "../netlify/functions/consultation.mjs";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { seedSql } from "../scripts/seed-sql.mjs";

test("peer projection omits identity and demographic details and never spreads unknown fields", () => {
  const profile = { id: "other", name: "Private person", category: "Staff", unit: "Unique unit", discipline: "Unique specialty", years: "11+", roles: ["Administrator"], email: "private@example.edu", added_sensitive_field: "private" };
  const peer = minimizeProfile(profile, "viewer");
  assert.equal(peer.name, "Consultation member");
  for (const key of ["category", "unit", "discipline", "years"]) assert.equal(peer[key], "");
  assert.equal("email" in peer, false);
  assert.equal("added_sensitive_field" in peer, false);
  assert.equal(minimizeProfile(profile, "other").name, "Private person");
  assert.equal(minimizeProfile(profile, "viewer", true).unit, "Unique unit");
});
test("small cells trigger complementary suppression and a minimum threshold of five", () => {
  assert.deepEqual(suppressedDistribution({ small: 1, large: 20, absent: 0 }, 5), { small: null, large: null, absent: null });
  assert.equal(suppressedDistribution({ small: 4 }, 1).small, null);
  assert.deepEqual(suppressedDistribution({ a: 5, b: 6 }, 5), { a: 5, b: 6 });
});
test("free-text saves require notice acknowledgment and reject obvious identifying data or hidden content", () => {
  const proposal = { action: "proposal", request_id: crypto.randomUUID(), question_id: "T1Q1", status: "Submitted", privacy_notice_version: PRIVACY_NOTICE_VERSION, content: { depth: "Quick response", type: "Recommendation", statement: "Offer training with fictional examples." } };
  assert.doesNotThrow(() => validateCommand(proposal));
  assert.throws(() => validateCommand({ ...proposal, privacy_notice_version: undefined }), /acknowledge/);
  for (const statement of ["Student ID: 1234567", "Patient name: Real Patient", "123-45-6789", "Contact actual.student@example.edu"]) {
    assert.throws(() => validateCommand({ ...proposal, content: { ...proposal.content, statement } }), /identifiers/);
  }
  assert.throws(() => validateCommand({ ...proposal, content: { ...proposal.content, medical_record: "hidden data" } }), /displayed proposal fields/);
});
test("attachments cannot bypass the app restriction through direct API calls", async () => {
  for (const method of ["GET", "POST"]) {
    const response = await attachment(new Request("http://localhost/api/attachment?id=private", { method }));
    assert.equal(response.status, 403);
    assert.match(response.headers.get("Cache-Control"), /no-store/);
  }
});
test("the institutional-review switch and public readiness bypass are removed", () => {
  const backend = readFileSync(new URL("../netlify/functions/consultation.mjs", import.meta.url), "utf8");
  const context = readFileSync(new URL("../netlify/functions/_consultation.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(backend, /dataReviewApproved|readiness/);
  assert.doesNotMatch(context, /requireDataReview/);
});
test("SQL reporting suppresses small author groups, complementary cells, and repeat contributions by one author", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);");
    await db.exec(readFileSync(new URL("../database/consultation-schema.sql", import.meta.url), "utf8"));
    await db.exec(seedSql());
    await db.exec(readFileSync(new URL("../database/reporting.sql", import.meta.url), "utf8"));
    const round = (await db.query("select id from nh_rounds limit 1")).rows[0].id;
    const users = [];
    for (let i = 0; i < 6; i++) {
      const id = crypto.randomUUID(); users.push(id);
      await db.query("insert into auth.users values($1)", [id]);
      await db.query("insert into nh_profiles values($1,$2,$3,$4,$5,$6)", [id, "Private person", i === 5 ? "Adjunct faculty" : "Staff", "Unique unit", "Unique discipline", "Prefer not to say"]);
      await db.query("insert into nh_contributions(consultation_id,round_id,author_id,question_id,status,content) values('north-harris-ai-norms',$1,$2,'T1Q1','Submitted',$3)", [round, id, JSON.stringify({ type: "Recommendation" })]);
    }
    await db.query("select nh_refresh_reporting()");
    const category = (await db.query("select value,suppressed,denominator from nh_analytics.metrics where page='Participation'")).rows;
    assert.equal(category.length, 2);
    assert(category.every((r) => r.value === null && r.suppressed && r.denominator === null));
    assert.equal((await db.query("select value from nh_analytics.metrics where page='Coverage'")).rows[0].value, 6);
    for (let i = 0; i < 6; i++)
      await db.query("insert into nh_contributions(consultation_id,round_id,author_id,question_id,status,content) values('north-harris-ai-norms',$1,$2,'T1Q2','Submitted',$3)", [round, users[0], JSON.stringify({ type: "Concern or objection" })]);
    await db.query("select nh_refresh_reporting()");
    const coverage = (await db.query("select value,suppressed from nh_analytics.metrics where page='Coverage'")).rows;
    assert.equal(coverage.length, 2);
    assert(coverage.every((r) => r.value === null && r.suppressed));
    assert.equal((await db.query("select count(*)::int n from nh_analytics.metrics where dimension in ('Unit','Discipline') or label in ('Unique unit','Unique discipline')")).rows[0].n, 0);
  } finally { await db.close(); }
});
