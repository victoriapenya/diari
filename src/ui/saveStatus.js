// Shared "Desant… / Desat / Error en desar" indicator for all editors.
export function createSaveStatus(element) {
  let inFlight = 0;
  let failed = false;

  function render() {
    if (inFlight > 0) {
      element.textContent = 'Desant…';
      element.dataset.state = 'saving';
    } else if (failed) {
      element.textContent = 'Error en desar. Torna-ho a provar.';
      element.dataset.state = 'error';
    } else {
      element.textContent = 'Desat';
      element.dataset.state = 'saved';
    }
  }

  return {
    // Wraps a save promise so the indicator reflects its progress.
    async track(promise) {
      inFlight += 1;
      render();
      try {
        const result = await promise;
        failed = false;
        return result;
      } catch (error) {
        failed = true;
        throw error;
      } finally {
        inFlight -= 1;
        render();
      }
    },

    clear() {
      if (inFlight > 0) return;
      failed = false;
      element.textContent = '';
      delete element.dataset.state;
    },
  };
}
