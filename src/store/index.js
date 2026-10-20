// The single store the UI talks to. Swap the implementation here (e.g. for
// Supabase in stage 3) without touching the UI.
import { createLocalStore } from './localStore.js';

export const store = createLocalStore();
