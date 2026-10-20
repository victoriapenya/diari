// Delays calls to `fn` until `wait` ms have passed without a new call.
// `flush()` runs a pending call immediately; `cancel()` drops it.
export function debounce(fn, wait) {
  let timer = null;
  let pendingArgs = null;

  function run() {
    const args = pendingArgs;
    timer = null;
    pendingArgs = null;
    return fn(...args);
  }

  function debounced(...args) {
    pendingArgs = args;
    clearTimeout(timer);
    timer = setTimeout(run, wait);
  }

  debounced.flush = () => {
    if (timer === null) return undefined;
    clearTimeout(timer);
    return run();
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    pendingArgs = null;
  };

  debounced.pending = () => timer !== null;

  return debounced;
}
