import test from "node:test";
import assert from "node:assert/strict";
import { initialDemo, demoWrite, visibleDemo } from "../src/lib/demo.ts";
test("demo honors role boundaries, private drafts, validation, and save receipts", () => {
  let feed = initialDemo();
  const actor = feed.profiles[0],
    committee = feed.profiles[2];
  const request = {
    action: "proposal",
    request_id: crypto.randomUUID(),
    question_id: "T1Q1",
    status: "Draft",
    content: {
      depth: "Quick response",
      type: "Concern or objection",
      statement: "Private draft",
    },
  };
  feed = demoWrite(feed, request, actor);
  assert.equal(feed.proposals.length, 2);
  feed = demoWrite(feed, request, actor);
  assert.equal(feed.proposals.length, 2);
  assert.equal(visibleDemo(feed, committee.id).proposals.length, 1);
  assert.throws(
    () =>
      demoWrite(
        feed,
        {
          action: "code",
          request_id: crypto.randomUUID(),
          id: "test",
          dimension: "Risk",
          label: "Privacy",
        },
        actor,
      ),
    /Committee/,
  );
  assert.throws(
    () =>
      demoWrite(
        feed,
        { action: "norm", request_id: crypto.randomUUID(), content: {} },
        committee,
      ),
    /Complete every norm/,
  );
});
