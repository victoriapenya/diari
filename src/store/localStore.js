// Entry store backed by Web Storage (localStorage).
//
// Store interface (shared with the future Supabase store). Every method
// returns a Promise so the UI does not depend on the backend being synchronous.
//
//   listEntries(day)          -> Entry[] for that day, oldest first
//   createEntry(day, content) -> Entry
//   updateEntry(id, content)  -> Entry
//   deleteEntry(id)           -> void
//   listDays()                -> [{ day, count }] for days with entries, newest first
//
// Entry: { id, day, content, createdAt, updatedAt } (timestamps are ISO strings)

const STORAGE_KEY = 'diari:entries:v1';

export function createLocalStore({
  storage = globalThis.localStorage,
  now = () => new Date(),
  newId = () => crypto.randomUUID(),
} = {}) {
  function readAll() {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAll(entries) {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  const byCreatedAt = (a, b) => a.createdAt.localeCompare(b.createdAt);

  return {
    async listEntries(day) {
      return readAll()
        .filter((entry) => entry.day === day)
        .sort(byCreatedAt);
    },

    async createEntry(day, content, { createdAt } = {}) {
      const timestamp = now().toISOString();
      const entry = {
        id: newId(),
        day,
        content,
        createdAt: createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      writeAll([...readAll(), entry]);
      return entry;
    },

    async updateEntry(id, content) {
      const entries = readAll();
      const index = entries.findIndex((entry) => entry.id === id);
      if (index === -1) throw new Error(`Entry not found: ${id}`);
      const updated = { ...entries[index], content, updatedAt: now().toISOString() };
      entries[index] = updated;
      writeAll(entries);
      return updated;
    },

    async deleteEntry(id) {
      writeAll(readAll().filter((entry) => entry.id !== id));
    },

    async listDays() {
      const counts = new Map();
      for (const entry of readAll()) {
        counts.set(entry.day, (counts.get(entry.day) ?? 0) + 1);
      }
      return [...counts.entries()]
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.day.localeCompare(a.day));
    },
  };
}
