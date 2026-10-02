import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { readQuestionBank } from "../scripts/consultation-content.mjs";
import { seedSql } from "../scripts/seed-sql.mjs";
import {
  validateCommand,
  summarizePulse,
  readAll,
} from "../netlify/functions/_consultation.mjs";
const ids = {
  member: "11111111-1111-4111-8111-111111111111",
  other: "22222222-2222-4222-8222-222222222222",
  committee: "33333333-3333-4333-8333-333333333333",
  admin: "44444444-4444-4444-8444-444444444444",
};
const c = "north-harris-ai-norms";
test("feed pagination preserves more than one thousand records", async () => {
  const records = Array.from({ length: 2501 }, (_, id) => ({ id }));
  const query = {
    range: (start, end) =>
      Promise.resolve({ data: records.slice(start, end + 1), error: null }),
  };
  assert.deepEqual(await readAll(query), records);
});
const cmd = (action, rest = {}) => ({
  action,
  request_id: crypto.randomUUID(),
  ...rest,
});
test("ordered migration artifacts install all content, deny policies, reporting key and source snapshots", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);",
    );
    const directory = new URL("../supabase/migrations/", import.meta.url);
    for (const file of readdirSync(directory)
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(readFileSync(new URL(file, directory), "utf8"));
    assert.equal(
      (await db.query("select count(*)::int total from nh_questions")).rows[0]
        .total,
      24,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::int total from pg_policies where schemaname='public' and policyname='nh_no_direct_client_access'",
        )
      ).rows[0].total,
      29,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::int total from pg_constraint where conrelid='nh_analytics.metrics'::regclass and contype='p'",
        )
      ).rows[0].total,
      1,
    );
    assert(
      (
        await db.query(
          "select column_name from information_schema.columns where table_name='nh_norms' and column_name='contribution_versions'",
        )
      ).rows.length,
    );
    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select * from nh_profiles"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
test("question bank exactly matches six tables and 24 stable version-2 questions", () => {
  const bank = readQuestionBank();
  assert.equal(bank.length, 6);
  assert.equal(bank.flatMap((t) => t.questions).length, 24);
  bank.forEach((t, i) => {
    assert.equal(t.id, `T${i + 1}`);
    assert.equal(t.questions.length, 4);
    t.questions.forEach((q, j) => {
      assert.equal(q.id, `T${i + 1}Q${j + 1}`);
      assert.equal(q.version, 2);
    });
  });
});
test("server input validation enforces depth, limits, reasons, and source evidence", () => {
  const proposal = cmd("proposal", {
    question_id: "T1Q1",
    status: "Submitted",
    content: {
      depth: "Quick response",
      type: "Concern or objection",
      statement: "A concern",
      visibility: "Members",
    },
  });
  assert.doesNotThrow(() => validateCommand(proposal));
  assert.throws(() =>
    validateCommand({
      ...proposal,
      content: { ...proposal.content, statement: "a".repeat(601) },
    }),
  );
  assert.throws(() =>
    validateCommand(
      cmd("position", {
        target_id: crypto.randomUUID(),
        revision: 1,
        kind: "proposal",
        position: "Support",
        body: "",
      }),
    ),
  );
  assert.throws(() =>
    validateCommand(cmd("norm", { content: { title: "Unsupported norm" } })),
  );
});
test("pulse suppression never returns names or small response categories", () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({
    stage: "Baseline",
    answers: {
      sentiment: i === 0 ? "Negative" : "Positive",
      experience: "Yes",
    },
  }));
  const aggregate = summarizePulse(rows, 5);
  assert.equal(aggregate.Baseline.answers.sentiment.suppressed, true);
  assert.equal(aggregate.Baseline.answers.experience.Yes, 6);
  assert.equal(aggregate.Closing.suppressed, true);
  assert(!JSON.stringify(aggregate).includes("author_id"));
});
test("database enforces roles, private grants, revisions, idempotence, closed rounds, and pulse receipts", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);",
    );
    await db.exec(
      readFileSync(
        new URL("../database/consultation-schema.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(seedSql());
    await db.exec(
      readFileSync(
        new URL("../database/reporting.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        new URL("../database/hardening.sql", import.meta.url),
        "utf8",
      ),
    );
    for (const [role, id] of Object.entries(ids)) {
      await db.query("insert into auth.users values($1)", [id]);
      await db.query("insert into nh_profiles values($1,$2,$3,$4,$5,$6)", [
        id,
        role,
        "Staff",
        "Testing",
        "Not a teaching role",
        "1–5 years",
      ]);
      await db.query("insert into nh_memberships values($1,$2,true)", [c, id]);
      await db.query("insert into nh_roles values($1,$2,$3)", [
        c,
        id,
        role === "admin"
          ? "Administrator"
          : role === "committee"
            ? "Committee"
            : "Participant",
      ]);
    }
    const write = async (actor, payload) =>
      (await db.query("select nh_write($1,$2) result", [actor, payload]))
        .rows[0].result;
    const proposal = cmd("proposal", {
      question_id: "T1Q1",
      status: "Draft",
      content: {
        depth: "Quick response",
        type: "Recommendation",
        statement: "Preserve learning evidence",
      },
    });
    await assert.rejects(write(ids.member, proposal), /closed/);
    await write(
      ids.admin,
      cmd("round", { name: "Test listening", phase: "Collect", open: true }),
    );
    const first = await write(ids.member, proposal);
    const retry = await write(ids.member, proposal);
    assert.deepEqual(first, retry);
    assert.equal(
      (await db.query("select count(*)::int total from nh_contributions"))
        .rows[0].total,
      1,
    );
    await assert.rejects(
      write(
        ids.other,
        cmd("proposal", {
          ...proposal,
          request_id: crypto.randomUUID(),
          id: first.id,
          revision: 1,
        }),
      ),
      /another member/,
    );
    const revised = await write(
      ids.member,
      cmd("proposal", {
        id: first.id,
        revision: 1,
        question_id: "T1Q1",
        status: "Submitted",
        content: { ...proposal.content, statement: "Revised evidence" },
      }),
    );
    assert.equal(revised.revision, 2);
    await assert.rejects(
      write(
        ids.member,
        cmd("proposal", {
          id: first.id,
          revision: 1,
          question_id: "T1Q1",
          status: "Submitted",
          content: proposal.content,
        }),
      ),
      /Conflict/,
    );
    assert.equal(
      (await db.query("select count(*)::int total from nh_revisions")).rows[0]
        .total,
      2,
    );
    await assert.rejects(
      write(
        ids.member,
        cmd("disposition", {
          id: first.id,
          revision: 2,
          outcome: "Deferred",
          reason: "Need evidence",
        }),
      ),
      /Committee/,
    );
    await write(
      ids.committee,
      cmd("disposition", {
        id: first.id,
        revision: 2,
        outcome: "Deferred",
        reason: "Need evidence",
      }),
    );
    await write(
      ids.committee,
      cmd("code", {
        id: "test-risk",
        dimension: "Risk",
        label: "Testing risk",
      }),
    );
    await write(
      ids.committee,
      cmd("coding", {
        id: first.id,
        revision: 2,
        codes: ["test-risk"],
        linked_ids: [],
      }),
    );
    await write(
      ids.committee,
      cmd("norm", {
        content: {
          title: "Test norm",
          text: "Keep learning evidence",
          scope: "Campus-wide baseline",
          strength: "Recommended",
          route: "Adopt at North Harris",
          applies_to: "Faculty",
          existing_rule: "https://www.lonestar.edu/OTS-AI-Guidelines",
          checked_on: "2026-10-02",
          review_date: "2027-10-02",
          reservations: "Review workload",
        },
        contribution_ids: [first.id],
        source_ids: ["ots-guidance"],
      }),
    );
    assert.equal(
      (await db.query("select contribution_versions from nh_norms")).rows[0]
        .contribution_versions[first.id].revision,
      2,
    );
    await write(
      ids.committee,
      cmd("draft", { status: "Published", response_summary: "" }),
    );
    await assert.rejects(
      write(
        ids.committee,
        cmd("draft", { status: "Final", response_summary: "" }),
      ),
      /response summary/,
    );
    await write(
      ids.member,
      cmd("position", {
        target_id: first.id,
        revision: 2,
        kind: "proposal",
        position: "Disagree",
        body: "Different view",
      }),
    );
    await write(
      ids.member,
      cmd("position", {
        target_id: first.id,
        revision: 2,
        kind: "proposal",
        position: "Support with changes",
        body: "Add an alternative",
      }),
    );
    assert.equal(
      (await db.query("select count(*)::int total from nh_positions")).rows[0]
        .total,
      1,
    );
    const pulse = cmd("pulse", {
      stage: "Baseline",
      answers: { sentiment: "Mixed" },
    });
    await write(ids.member, pulse);
    await db.query("select nh_refresh_reporting()");
    assert(
      (
        await db.query(
          "select value from nh_analytics.metrics where page='Participation'",
        )
      ).rows.every((r) => r.value === null),
    );
    assert.equal(
      (
        await db.query(
          "select value from nh_analytics.metrics where page='Themes & risks' and label='Testing risk'",
        )
      ).rows[0].value,
      1,
    );
    await db.exec("set role nh_bi_reader");
    assert(
      (await db.query("select * from nh_analytics.metrics")).rows.length > 0,
    );
    await assert.rejects(
      db.query("select * from nh_profiles"),
      /permission denied/,
    );
    await db.exec("reset role");
    await assert.rejects(
      write(
        ids.member,
        cmd("pulse", { stage: "Baseline", answers: { sentiment: "Mixed" } }),
      ),
      /duplicate key/,
    );
    await db.exec("set role authenticated");
    await assert.rejects(
      db.query("select * from nh_contributions"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select nh_write($1,$2)", [ids.member, proposal]),
      /permission denied/,
    );
    await db.exec("reset role");
    const tables = (
      await db.query(
        "select tablename,rowsecurity from pg_tables where schemaname='public' and tablename like 'nh_%'",
      )
    ).rows;
    assert(tables.every((t) => t.rowsecurity));
    await write(
      ids.admin,
      cmd("round", { name: "Closed", phase: "Closed", open: false }),
    );
    await assert.rejects(
      write(
        ids.member,
        cmd("comment", {
          target_id: first.id,
          revision: 2,
          kind: "proposal",
          body: "Late comment",
        }),
      ),
      /closed/,
    );
    const backup = await db.dumpDataDir();
    const restored = new PGlite({ loadDataDir: backup });
    try {
      assert.equal(
        (await restored.query("select count(*)::int total from nh_revisions"))
          .rows[0].total,
        2,
      );
      assert.equal(
        (await restored.query("select count(*)::int total from nh_norms"))
          .rows[0].total,
        1,
      );
      await restored.exec("set role authenticated");
      await assert.rejects(
        restored.query("select * from nh_contributions"),
        /permission denied/,
      );
    } finally {
      await restored.close();
    }
  } finally {
    await db.close();
  }
});
