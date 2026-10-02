// Append-only prototype: preserve newer local notes and cached file contents.
export function mergeAppendOnlyState(remote, local) {
  const merge = (server = [], browser = []) => {
    const items = new Map(server.map(item => [item.id, item]));
    for (const item of browser) items.set(item.id, { ...items.get(item.id), ...item });
    return [...items.values()];
  };
  return {
    ...remote,
    tables: Object.fromEntries(Object.keys({ ...remote.tables, ...local.tables })
      .map(key => [key, merge(remote.tables?.[key], local.tables?.[key])])),
    actions: merge(remote.actions, local.actions),
    files: merge(remote.files, local.files),
    resources: merge(remote.resources, local.resources),
  };
}

// Serialize all actions; never debounce away rapid edits. A failed action is
// retained in memory and retried when the next change is enqueued.
export function createSaveQueue(send, onSaved, onFailure) {
  const pending = [];
  let running = false;
  let disposed = false;
  async function drain() {
    if (running || disposed) return;
    running = true;
    try {
      while (pending.length && !disposed) {
        const result = await send(pending[0]);
        pending.shift();
        if (!disposed) onSaved(result);
      }
    } catch (error) {
      if (!disposed) onFailure(error);
    } finally { running = false; }
  }
  return {
    enqueue(action) { if (!disposed) { pending.push(action); return drain(); } },
    dispose() { disposed = true; pending.length = 0; },
  };
}
