import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalStore } from '../../src/store/localStore.js';

// Minimal in-memory Web Storage so tests never touch the real localStorage.
function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

// Clock that advances one minute on every call, for predictable ordering.
function steppingClock(start = new Date(2026, 9, 20, 9, 0)) {
  let t = start.getTime();
  return () => {
    const date = new Date(t);
    t += 60_000;
    return date;
  };
}

function idSequence() {
  let n = 0;
  return () => `id-${++n}`;
}

describe('E1-H8 local store', () => {
  let storage;
  let store;

  beforeEach(() => {
    storage = memoryStorage();
    store = createLocalStore({ storage, now: steppingClock(), newId: idSequence() });
  });

  describe('E1-H3 create and read by day', () => {
    it('creates an entry with id and timestamps', async () => {
      const entry = await store.createEntry('2026-10-20', 'Hola');
      expect(entry).toMatchObject({ id: 'id-1', day: '2026-10-20', content: 'Hola' });
      expect(entry.createdAt).toBe(new Date(2026, 9, 20, 9, 0).toISOString());
      expect(entry.updatedAt).toBe(entry.createdAt);
    });

    it('keeps a creation time passed by the caller', async () => {
      const createdAt = new Date(2026, 9, 20, 8, 15).toISOString();
      const entry = await store.createEntry('2026-10-20', 'Draft', { createdAt });
      expect(entry.createdAt).toBe(createdAt);
    });

    it('returns only the entries of the requested day, oldest first', async () => {
      await store.createEntry('2026-10-20', 'first');
      await store.createEntry('2026-10-19', 'other day');
      await store.createEntry('2026-10-20', 'second');

      const entries = await store.listEntries('2026-10-20');
      expect(entries.map((e) => e.content)).toEqual(['first', 'second']);
    });

    it('sorts by creation time, not by insertion order', async () => {
      const late = new Date(2026, 9, 20, 22, 0).toISOString();
      const early = new Date(2026, 9, 20, 7, 0).toISOString();
      await store.createEntry('2026-10-20', 'late', { createdAt: late });
      await store.createEntry('2026-10-20', 'early', { createdAt: early });

      const entries = await store.listEntries('2026-10-20');
      expect(entries.map((e) => e.content)).toEqual(['early', 'late']);
    });

    it('returns an empty list for a day without entries', async () => {
      expect(await store.listEntries('2026-01-01')).toEqual([]);
    });
  });

  describe('E1-H4 update', () => {
    it('updates the content and updatedAt, keeping createdAt', async () => {
      const entry = await store.createEntry('2026-10-20', 'v1');
      const updated = await store.updateEntry(entry.id, 'v2');

      expect(updated.content).toBe('v2');
      expect(updated.createdAt).toBe(entry.createdAt);
      expect(updated.updatedAt > entry.updatedAt).toBe(true);
      expect((await store.listEntries('2026-10-20'))[0].content).toBe('v2');
    });

    it('allows saving an existing entry as empty', async () => {
      const entry = await store.createEntry('2026-10-20', 'text');
      await store.updateEntry(entry.id, '');
      expect(await store.listEntries('2026-10-20')).toHaveLength(1);
    });

    it('rejects unknown ids', async () => {
      await expect(store.updateEntry('nope', 'x')).rejects.toThrow('Entry not found');
    });

    it('persists across store instances (page reload)', async () => {
      const entry = await store.createEntry('2026-10-20', 'saved');
      await store.updateEntry(entry.id, 'saved and edited');

      const reloaded = createLocalStore({ storage });
      const entries = await reloaded.listEntries('2026-10-20');
      expect(entries.map((e) => e.content)).toEqual(['saved and edited']);
    });
  });

  describe('E1-H5 delete', () => {
    it('removes the entry and it stays removed after reload', async () => {
      const a = await store.createEntry('2026-10-20', 'keep');
      const b = await store.createEntry('2026-10-20', 'remove');
      await store.deleteEntry(b.id);

      const reloaded = createLocalStore({ storage });
      const entries = await reloaded.listEntries('2026-10-20');
      expect(entries.map((e) => e.id)).toEqual([a.id]);
    });

    it('ignores unknown ids', async () => {
      await store.createEntry('2026-10-20', 'x');
      await store.deleteEntry('nope');
      expect(await store.listEntries('2026-10-20')).toHaveLength(1);
    });
  });

  describe('E1-H6 list days', () => {
    it('lists days with entries, newest first, with counts', async () => {
      await store.createEntry('2026-10-18', 'a');
      await store.createEntry('2026-10-20', 'b');
      await store.createEntry('2026-10-20', 'c');
      await store.createEntry('2025-12-31', 'd');

      expect(await store.listDays()).toEqual([
        { day: '2026-10-20', count: 2 },
        { day: '2026-10-18', count: 1 },
        { day: '2025-12-31', count: 1 },
      ]);
    });

    it('drops a day once its last entry is deleted', async () => {
      const entry = await store.createEntry('2026-10-18', 'only');
      await store.deleteEntry(entry.id);
      expect(await store.listDays()).toEqual([]);
    });
  });

  describe('robustness', () => {
    it('treats corrupt stored data as empty', async () => {
      storage.setItem('diari:entries:v1', '{not json');
      expect(await store.listEntries('2026-10-20')).toEqual([]);
      expect(await store.listDays()).toEqual([]);
    });
  });
});
