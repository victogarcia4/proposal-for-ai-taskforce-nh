import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveQueue, mergeAppendOnlyState } from '../src/lib/persistence.mjs';

test('rapid edits are sent in order without dropping an action', async () => {
  const sent = [];
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const queue = createSaveQueue(async action => {
    sent.push(action);
    if (action === 'first') await first;
    return action;
  }, () => {}, error => { throw error; });
  const completed = queue.enqueue('first');
  queue.enqueue('second');
  queue.enqueue('third');
  release();
  await completed;
  assert.deepEqual(sent, ['first', 'second', 'third']);
});

test('a failed action is retried before the next action', async () => {
  const sent = [];
  let fail = true;
  let errors = 0;
  const queue = createSaveQueue(async action => {
    sent.push(action);
    if (fail) { fail = false; throw new Error('offline'); }
    return action;
  }, () => {}, () => errors++);
  await queue.enqueue('first');
  await queue.enqueue('second');
  assert.equal(errors, 1);
  assert.deepEqual(sent, ['first', 'first', 'second']);
});

test('a server response cannot erase an unsent note or local file bytes', () => {
  const result = mergeAppendOnlyState(
    { tables: { curriculum: [{ id: 'old' }] }, files: [{ id: 'file', name: 'notes.md' }] },
    { tables: { curriculum: [{ id: 'old' }, { id: 'new', text: 'New idea' }] }, files: [{ id: 'file', localContentBase64: 'eA==' }] }
  );
  assert.deepEqual(result.tables.curriculum.map(item => item.id), ['old', 'new']);
  assert.equal(result.files[0].localContentBase64, 'eA==');
  assert.equal(result.files[0].name, 'notes.md');
});

test('disposing prevents late responses from updating an unmounted dashboard', async () => {
  let release;
  let updates = 0;
  const queue = createSaveQueue(() => new Promise(resolve => { release = resolve; }), () => updates++, () => {});
  const completed = queue.enqueue('first');
  queue.dispose();
  release({});
  await completed;
  await queue.enqueue('second');
  assert.equal(updates, 0);
});
