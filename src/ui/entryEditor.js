import { debounce } from '../lib/debounce.js';
import { formatTime } from '../lib/dates.js';

const AUTOSAVE_DELAY_MS = 500;

// Renders one entry and keeps it in sync with the store.
// `entry` may be a draft ({ id: null, ... }): it is only created in the store
// once it has some text.
export function createEntryEditor({ entry, store, saveStatus, onCreated, onRemoved }) {
  let current = { ...entry };
  let lastSaved = current.content;
  // Saves run one after another, so a draft is never created twice.
  let queue = Promise.resolve();

  const item = document.createElement('li');
  item.className = 'entry';

  const time = document.createElement('time');
  time.className = 'entry-time';
  time.dateTime = current.createdAt;
  time.textContent = formatTime(current.createdAt);

  const textarea = document.createElement('textarea');
  textarea.className = 'entry-text';
  textarea.rows = 4;
  textarea.value = current.content;
  textarea.setAttribute('aria-label', `Entrada de les ${time.textContent}`);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'entry-delete';
  deleteButton.textContent = 'Esborrar';

  const header = document.createElement('div');
  header.className = 'entry-header';
  header.append(time, deleteButton);
  item.append(header, textarea);

  const isDraft = () => current.id === null;

  function save() {
    queue = queue.then(async () => {
      const content = textarea.value;
      if (content === lastSaved) return;
      // A new entry that is still empty is never stored (E1-H3).
      if (isDraft() && content.trim() === '') return;

      try {
        if (isDraft()) {
          current = await saveStatus.track(
            store.createEntry(current.day, content, { createdAt: current.createdAt }),
          );
          onCreated?.(current);
        } else {
          current = await saveStatus.track(store.updateEntry(current.id, content));
        }
        lastSaved = content;
      } catch (error) {
        // The text stays in the textarea; the next edit or blur retries.
        console.error('Save failed', error);
      }
    });
    return queue;
  }

  const scheduleSave = debounce(save, AUTOSAVE_DELAY_MS);

  textarea.addEventListener('input', () => scheduleSave());

  textarea.addEventListener('blur', () => {
    scheduleSave.cancel();
    save().then(() => {
      if (isDraft() && textarea.value.trim() === '') remove();
    });
  });

  deleteButton.addEventListener('click', async () => {
    if (isDraft()) {
      scheduleSave.cancel();
      remove();
      return;
    }
    if (!window.confirm('Segur que vols esborrar aquesta entrada?')) return;
    scheduleSave.cancel();
    await queue;
    try {
      await saveStatus.track(store.deleteEntry(current.id));
      remove();
    } catch (error) {
      console.error('Delete failed', error);
    }
  });

  function remove() {
    item.remove();
    onRemoved?.(current);
  }

  return {
    element: item,
    focus: () => textarea.focus(),
    // Saves any pending text right away (before navigating or unloading).
    flush() {
      scheduleSave.cancel();
      return save();
    },
  };
}
