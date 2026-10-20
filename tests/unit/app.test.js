import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from '../../src/ui/app.js';
import { createLocalStore } from '../../src/store/localStore.js';

const html = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/, '');

const NOW = new Date(2026, 9, 20, 15, 30);

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Lets pending promise chains (store calls, renders) settle.
const settle = () => vi.advanceTimersByTimeAsync(0);

function type(textarea, value) {
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
}

function blur(textarea) {
  textarea.dispatchEvent(new Event('blur'));
}

describe('E1 diary UI', () => {
  let storage;

  async function startApp(hash = '') {
    history.replaceState(null, '', `/${hash}`);
    document.body.innerHTML = body;
    const store = createLocalStore({ storage });
    createApp({ root: document, store, now: () => NOW }).start();
    await settle();
    return store;
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    storage = memoryStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('E1-H1 open today', () => {
    it('shows today in long Catalan form and puts it in the URL', async () => {
      await startApp();
      expect($('[data-day-title]').textContent).toBe('dimarts, 20 d’octubre del 2026');
      expect(window.location.hash).toBe('#/2026-10-20');
    });
  });

  describe('E1-H2 navigate between days', () => {
    it('disables «Dia següent» and limits the picker on today', async () => {
      await startApp();
      expect($('[data-next]').disabled).toBe(true);
      expect($('[data-picker]').max).toBe('2026-10-20');
    });

    it('opens a past day from the URL and enables «Dia següent»', async () => {
      await startApp('#/2026-10-01');
      expect($('[data-day-title]').textContent).toBe('dijous, 1 d’octubre del 2026');
      expect($('[data-next]').disabled).toBe(false);
    });

    it.each(['#/2026-10-21', '#/2099-01-01', '#/no-es-una-data'])(
      'redirects %s to today',
      async (hash) => {
        await startApp(hash);
        expect(window.location.hash).toBe('#/2026-10-20');
        expect($('[data-day-title]').textContent).toContain('20 d’octubre');
      },
    );

    it('ignores a future date typed into the picker', async () => {
      await startApp();
      const picker = $('[data-picker]');
      picker.value = '2026-10-25';
      picker.dispatchEvent(new Event('change'));
      expect(window.location.hash).toBe('#/2026-10-20');
      expect(picker.value).toBe('2026-10-20');
    });
  });

  describe('E1-H3 create an entry', () => {
    it('adds an empty, focused entry showing its time', async () => {
      await startApp();
      $('[data-new-entry]').click();
      const textarea = $('.entry-text');
      expect(document.activeElement).toBe(textarea);
      expect($('.entry-time').textContent).toBe('15:30');
    });

    it('does not store a new entry left empty on blur', async () => {
      const store = await startApp();
      $('[data-new-entry]').click();
      blur($('.entry-text'));
      await settle();
      expect($$('.entry')).toHaveLength(0);
      expect(await store.listEntries('2026-10-20')).toEqual([]);
    });
  });

  describe('E1-H4 autosave', () => {
    it('saves ~500 ms after typing, shows the status and survives a reload', async () => {
      const store = await startApp();
      $('[data-new-entry]').click();
      type($('.entry-text'), 'Primera');

      await vi.advanceTimersByTimeAsync(400);
      expect(await store.listEntries('2026-10-20')).toEqual([]);

      await vi.advanceTimersByTimeAsync(100);
      expect($('[data-save-status]').textContent).toBe('Desat');

      $('[data-new-entry]').click();
      type($$('.entry-text')[1], 'Segona');
      blur($$('.entry-text')[1]);
      await settle();

      await startApp(); // reload
      expect($$('.entry-text').map((t) => t.value)).toEqual(['Primera', 'Segona']);
    });

    it('keeps the text on screen and shows an error if saving fails', async () => {
      const store = await startApp();
      vi.spyOn(store, 'createEntry').mockRejectedValue(new Error('offline'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      $('[data-new-entry]').click();
      type($('.entry-text'), 'No em perdis');
      await vi.advanceTimersByTimeAsync(500);

      expect($('[data-save-status]').textContent).toContain('Error en desar');
      expect($('.entry-text').value).toBe('No em perdis');
    });
  });

  describe('E1-H5 delete an entry', () => {
    it('asks for confirmation and removes it for good', async () => {
      const store = await startApp();
      await store.createEntry('2026-10-20', 'Esborra’m');
      await startApp();

      const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
      $('.entry-delete').click();
      await settle();
      expect(confirm).toHaveBeenCalled();
      expect($$('.entry')).toHaveLength(1);

      confirm.mockReturnValueOnce(true);
      $('.entry-delete').click();
      await settle();
      expect($$('.entry')).toHaveLength(0);

      await startApp();
      expect($$('.entry')).toHaveLength(0);
    });
  });

  describe('E1-H6 days with entries', () => {
    it('lists only days with entries, newest first, as links', async () => {
      const store = await startApp();
      await store.createEntry('2026-10-01', 'a');
      await store.createEntry('2026-10-15', 'b');
      await startApp();

      const links = $$('[data-days-list] a');
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['#/2026-10-15', '#/2026-10-01']);
    });
  });

  describe('E1-H7 empty state', () => {
    it('shows the empty message on a day without entries', async () => {
      await startApp();
      const empty = $('[data-empty-state]');
      expect(empty.hidden).toBe(false);
      expect(empty.textContent).toBe('Encara no has escrit res aquest dia');

      $('[data-new-entry]').click();
      expect(empty.hidden).toBe(true);
    });
  });
});
