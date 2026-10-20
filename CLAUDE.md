# Diari web

Diari web senzill i multiusuària: cada usuària obre un dia (avui o un de passat) i hi escriu diverses entrades. Cada diari és privat.

Els requisits, agrupats per etapes, són a `REQUISITS.md`. Abans de començar una etapa, llegeix-ne les històries.

## Stack

- **Frontend**: Vite + JavaScript sense framework (ES modules, DOM directe).
- **Backend**: Supabase — Auth (email + contrasenya, sense registre públic) i Postgres amb Row Level Security.
- **Tests**: Vitest (unitaris), Playwright (E2E contra Supabase local).
- **CI/CD**: GitHub Actions; desplegament a GitHub Pages.
- **Gestor de paquets**: npm.

## Ordres

```sh
npm run dev        # development server
npm run build      # production build into dist/
npm run lint       # lint
npm test           # Vitest unit tests
npm run test:e2e   # Playwright E2E tests (needs local Supabase running)
npx supabase start # start local Supabase (needs Docker)
```

## Estructura prevista

```
src/
  main.js          # entry point, wiring
  ui/              # DOM rendering and event handlers
  lib/             # pure logic (dates, formatting, validation) — no DOM, no I/O
  store/           # storage layer: localStore.js, supabaseStore.js (same interface)
tests/
  unit/            # Vitest
  e2e/             # Playwright
supabase/
  migrations/      # SQL migrations (schema + RLS)
  seed.sql         # test users and data
```

## Convencions

- **Llengua**: el codi, els noms i els comentaris en anglès. Els textos de la interfície en català.
- **Lògica pura separada del DOM**: tot el que es pot testejar sense navegador va a `src/lib/` i té tests a `tests/unit/`.
- **Capa d'emmagatzematge única**: la UI només parla amb un `store` amb una interfície fixa (crear, llegir per dia, actualitzar, esborrar, llistar dies…). Canviar de `localStorage` a Supabase no ha de tocar la UI.
- **Dates**: un dia és un string `YYYY-MM-DD` en hora local. Per mostrar-les, `Intl.DateTimeFormat` amb locale `ca`. No es poden obrir dies futurs.
- **Desat automàtic** amb debounce; mai es perd text de la pantalla si un desat falla.
- **Seguretat**:
  - Només l'anon key de Supabase al frontend, via `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`. `.env` no es puja mai; hi ha un `.env.example`.
  - La service role key no apareix mai al frontend ni al repositori.
  - Tota taula nova té RLS activada amb polítiques `user_id = auth.uid()` i un test que ho comprova.
  - El markdown es saneja abans d'inserir-lo al DOM.
- **Esquema**: tot canvi de base de dades és una migració nova a `supabase/migrations/`. Mai s'editen migracions ja fusionades.
- **Tests**: tota història nova arriba amb els seus tests. Els tests citen l'identificador de la història (p. ex. `describe('E1-H4 autosave', …)`).

## Flux de treball

- **Cada etapa es fa en una branca pròpia i entra a `main` amb una PR.** Mai es fa push directe a `main`.
- Nom de branca: `etapa-N-descripcio-curta` (p. ex. `etapa-1-diari-local`, `etapa-3-supabase-auth`).
- La PR enumera les històries que tanca (`E3-H1`, `E3-H2`…) i només es fusiona amb la CI en verd.
- Commits amb **Conventional Commits en anglès**: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`, `ci:` (p. ex. `feat: add autosave to entry editor`).
- Commits petits i amb sentit propi dins la branca.

## Normes per a Claude

- Respon en català i explica breument què has canviat i per què (estic aprenent).
- No facis servir `sudo` sense demanar-m'ho i explicar per què.
- Sistema: Arch Linux. Paquets amb `pacman`; avisa'm abans d'instal·lar res de l'AUR. La CLI de Supabase s'usa via npm (`npx supabase`), no cal l'AUR.
- Pregunta abans d'esborrar fitxers.
- No passis a l'etapa següent sense que l'anterior s'hagi fusionat a `main`.
