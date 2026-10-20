import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../src/lib/debounce.js';

describe('E1-H4 autosave debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls once, with the last arguments, after the wait', () => {
    const fn = vi.fn();
    const save = debounce(fn, 500);

    save('a');
    vi.advanceTimersByTime(300);
    save('ab');
    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('ab');
  });

  it('flush runs the pending call immediately (save on blur)', () => {
    const fn = vi.fn(() => 'done');
    const save = debounce(fn, 500);

    save('text');
    expect(save.pending()).toBe(true);
    expect(save.flush()).toBe('done');
    expect(fn).toHaveBeenCalledWith('text');
    expect(save.pending()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('flush does nothing when nothing is pending', () => {
    const fn = vi.fn();
    const save = debounce(fn, 500);
    expect(save.flush()).toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel drops the pending call', () => {
    const fn = vi.fn();
    const save = debounce(fn, 500);
    save('x');
    save.cancel();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});
