import {
  today,
  previousDay,
  nextDay,
  formatLong,
  dayFromHash,
  hashForDay,
  isOpenable,
} from '../lib/dates.js';
import { createEntryEditor } from './entryEditor.js';
import { createSaveStatus } from './saveStatus.js';

export function createApp({ root, store, now = () => new Date() }) {
  const $ = (selector) => root.querySelector(selector);
  const el = {
    title: $('[data-day-title]'),
    prev: $('[data-prev]'),
    next: $('[data-next]'),
    todayButton: $('[data-today]'),
    picker: $('[data-picker]'),
    entries: $('[data-entries]'),
    emptyState: $('[data-empty-state]'),
    newEntry: $('[data-new-entry]'),
    daysList: $('[data-days-list]'),
    daysEmpty: $('[data-days-empty]'),
  };

  const saveStatus = createSaveStatus($('[data-save-status]'));
  let currentDay = null;
  let editors = [];
  // Ignores results of a previous day's load if the user navigated meanwhile.
  let loadToken = 0;

  function goTo(day) {
    window.location.hash = hashForDay(day);
  }

  function flushAll() {
    return Promise.all(editors.map((editor) => editor.flush()));
  }

  function updateEmptyState() {
    el.emptyState.hidden = editors.length > 0;
  }

  function addEditor(entry) {
    const editor = createEntryEditor({
      entry,
      store,
      saveStatus,
      onCreated: () => renderDays(),
      onRemoved: (removed) => {
        editors = editors.filter((e) => e !== editor);
        updateEmptyState();
        if (removed.id !== null) renderDays();
      },
    });
    editors.push(editor);
    el.entries.append(editor.element);
    updateEmptyState();
    return editor;
  }

  function renderNav(day) {
    const todayDay = today(now());
    el.title.textContent = formatLong(day);
    el.next.disabled = day >= todayDay;
    el.todayButton.disabled = day === todayDay;
    el.picker.max = todayDay;
    el.picker.value = day;
  }

  async function renderDays() {
    const days = await store.listDays();
    el.daysEmpty.hidden = days.length > 0;
    el.daysList.replaceChildren(
      ...days.map(({ day, count }) => {
        const link = document.createElement('a');
        link.href = hashForDay(day);
        link.textContent = formatLong(day);
        if (day === currentDay) link.setAttribute('aria-current', 'date');

        const badge = document.createElement('span');
        badge.className = 'days-count';
        badge.textContent = count === 1 ? '1 entrada' : `${count} entrades`;

        const item = document.createElement('li');
        item.append(link, ' ', badge);
        return item;
      }),
    );
  }

  async function showDay(day) {
    await flushAll();
    currentDay = day;
    const token = ++loadToken;

    renderNav(day);
    saveStatus.clear();
    editors = [];
    el.entries.replaceChildren();
    el.emptyState.hidden = true;

    const entries = await store.listEntries(day);
    if (token !== loadToken) return;
    entries.forEach(addEditor);
    updateEmptyState();
    renderDays();
  }

  // Applies the current URL hash, redirecting invalid or future days to today.
  function route() {
    const day = dayFromHash(window.location.hash, now());
    if (window.location.hash !== hashForDay(day)) {
      history.replaceState(null, '', hashForDay(day));
    }
    showDay(day);
  }

  function createDraft() {
    const editor = addEditor({
      id: null,
      day: currentDay,
      content: '',
      createdAt: now().toISOString(),
    });
    editor.focus();
  }

  function start() {
    el.prev.addEventListener('click', () => goTo(previousDay(currentDay)));
    el.next.addEventListener('click', () => {
      const day = nextDay(currentDay);
      if (isOpenable(day, now())) goTo(day);
    });
    el.todayButton.addEventListener('click', () => goTo(today(now())));
    el.picker.addEventListener('change', () => {
      if (isOpenable(el.picker.value, now())) goTo(el.picker.value);
      else el.picker.value = currentDay;
    });
    el.newEntry.addEventListener('click', createDraft);

    window.addEventListener('hashchange', route);
    // localStorage writes are synchronous, so this saves before the page goes away.
    window.addEventListener('pagehide', flushAll);

    route();
  }

  return { start };
}
