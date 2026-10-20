# Requisits — Diari web

Un diari web senzill: cada usuària obre el dia d'avui (o un dia passat) i hi escriu les entrades que vol. Cada usuària té el seu diari privat.

## Com llegir aquest document

- Cada història té un identificador `EN-HM` (etapa N, història M). Les PR, els commits i els tests el poden citar.
- Format: **Com a** … **vull** … **per** …, seguit de criteris d'acceptació verificables.
- Una etapa està acabada quan tots els seus criteris es compleixen i la PR ha entrat a `main`.

## Glossari

- **Dia**: una data del calendari (`YYYY-MM-DD`, zona horària local).
- **Entrada**: un text escrit dins d'un dia. Un dia pot tenir diverses entrades, cadascuna amb la seva hora de creació.

---

## Etapa 1 — Diari mínim al navegador

Les dades es desen a `localStorage`. Encara no hi ha usuàries ni servidor.

### E1-H1 · Obrir el dia d'avui
**Com a** usuària, **vull** que l'aplicació s'obri pel dia d'avui **per** començar a escriure de seguida.
- [ ] En carregar l'aplicació es mostra el dia d'avui.
- [ ] La data es mostra en català i en format llarg (p. ex. «dilluns, 20 d'octubre de 2026»).

### E1-H2 · Navegar entre dies
**Com a** usuària, **vull** canviar de dia **per** llegir o completar dies anteriors.
- [ ] Hi ha botons «Dia anterior» i «Dia següent» i un selector de data.
- [ ] No es pot anar a un dia futur: el botó «Dia següent» està desactivat quan el dia mostrat és avui, i el selector no permet dates posteriors a avui.
- [ ] Hi ha un botó «Avui» que torna al dia d'avui.
- [ ] El dia seleccionat queda reflectit a la URL (p. ex. `#/2026-10-20`), de manera que recarregar la pàgina manté el dia.
- [ ] Una URL amb una data futura o invàlida redirigeix a avui.

### E1-H3 · Crear una entrada
**Com a** usuària, **vull** afegir una entrada nova al dia **per** escriure-hi diverses vegades al llarg del dia.
- [ ] Un botó «Nova entrada» crea una entrada buida al dia mostrat i hi posa el focus.
- [ ] Cada entrada mostra la seva hora de creació (`HH:MM`).
- [ ] Les entrades del dia es mostren ordenades per hora de creació, de més antiga a més nova.
- [ ] Una entrada que es deixa buida i perd el focus no es desa.

### E1-H4 · Editar amb desat automàtic
**Com a** usuària, **vull** que el que escric es desi sol **per** no perdre feina.
- [ ] El text es desa automàticament poc després de deixar d'escriure (debounce d'uns 500 ms).
- [ ] Un indicador mostra «Desant…» i després «Desat».
- [ ] Si es tanca o recarrega la pàgina, el text desat hi continua.
- [ ] Es desa també quan l'entrada perd el focus.

### E1-H5 · Esborrar una entrada
**Com a** usuària, **vull** esborrar una entrada **per** eliminar el que ja no vull guardar.
- [ ] Cada entrada té un botó «Esborrar».
- [ ] Abans d'esborrar es demana confirmació.
- [ ] Després de confirmar, l'entrada desapareix i no torna en recarregar.

### E1-H6 · Veure quins dies tenen entrades
**Com a** usuària, **vull** una llista o calendari dels dies amb entrades **per** saltar-hi ràpidament.
- [ ] Una vista mostra els dies que tenen almenys una entrada, del més recent al més antic.
- [ ] Clicar un dia l'obre.
- [ ] Els dies sense entrades no hi apareixen.

### E1-H7 · Estat buit
**Com a** usuària, **vull** un missatge clar quan un dia no té entrades **per** saber què puc fer.
- [ ] Si el dia no té entrades es mostra «Encara no has escrit res aquest dia» i el botó «Nova entrada».

### E1-H8 · Lògica testejada
**Com a** desenvolupadora, **vull** tests unitaris de la lògica pura **per** poder canviar el codi amb confiança.
- [ ] Les funcions de dates (avui, dia anterior/següent, validar que no és futur, format en català) tenen tests de Vitest.
- [ ] El magatzem local (crear, llegir per dia, actualitzar, esborrar, llistar dies) té tests de Vitest.
- [ ] `npm test` passa.

---

## Etapa 2 — GitHub, CI i desplegament

### E2-H1 · Repositori a GitHub
**Com a** desenvolupadora, **vull** el codi a GitHub **per** treballar amb branques i PR.
- [ ] El repositori existeix a GitHub i `main` hi està pujada.
- [ ] `main` està protegida: no s'hi pot fer push directe, cal una PR amb la CI en verd.

### E2-H2 · Integració contínua
**Com a** desenvolupadora, **vull** que cada canvi es comprovi automàticament **per** detectar errors abans de fusionar.
- [ ] Un workflow de GitHub Actions s'executa a cada PR i a cada push a `main`.
- [ ] El workflow fa `npm ci`, `npm run lint`, `npm test` i `npm run build`.
- [ ] Si algun pas falla, la PR no es pot fusionar.

### E2-H3 · Desplegament a GitHub Pages
**Com a** usuària, **vull** accedir al diari des d'una URL pública **per** fer-lo servir des de qualsevol lloc.
- [ ] En fusionar a `main`, l'aplicació es construeix i es publica a GitHub Pages automàticament.
- [ ] La configuració `base` de Vite és correcta i tots els recursos carreguen a la URL de Pages.
- [ ] La URL publicada apareix al README.

---

## Etapa 3 — Supabase: login i RLS

### E3-H1 · Iniciar sessió
**Com a** usuària, **vull** iniciar sessió amb email i contrasenya **per** accedir al meu diari.
- [ ] Sense sessió es mostra el formulari d'inici de sessió i no el diari.
- [ ] Amb credencials correctes s'obre el dia d'avui.
- [ ] Amb credencials incorrectes es mostra un missatge d'error en català, sense revelar si l'email existeix.
- [ ] La sessió es manté en recarregar la pàgina.

### E3-H2 · Tancar sessió
**Com a** usuària, **vull** tancar la sessió **per** protegir el meu diari en un ordinador compartit.
- [ ] Un botó «Tancar sessió» és visible quan hi ha sessió.
- [ ] Després de tancar sessió es torna al formulari i les entrades ja no són visibles.

### E3-H3 · Accés només per invitació
**Com a** administradora, **vull** que només les persones que convido puguin entrar **per** controlar qui fa servir el diari.
- [ ] L'aplicació no té formulari de registre.
- [ ] El registre públic està desactivat a Supabase; els comptes es creen o es conviden des del panell de Supabase.
- [ ] El procés per convidar una usuària està documentat al README.

### E3-H4 · Entrades a la base de dades
**Com a** usuària, **vull** que les meves entrades es guardin al servidor **per** veure-les des de qualsevol dispositiu.
- [ ] Existeix la taula `entries` (`id`, `user_id`, `entry_date`, `content`, `created_at`, `updated_at`) creada amb una migració SQL a `supabase/migrations/`.
- [ ] El magatzem de Supabase implementa la mateixa interfície que el magatzem local; la UI no canvia.
- [ ] Totes les històries de l'etapa 1 continuen funcionant amb Supabase.
- [ ] Les dades de `localStorage` de l'etapa 1 no es migren ni es fan servir.
- [ ] Si una operació falla (p. ex. sense connexió), es mostra un error i el text no es perd de la pantalla.

### E3-H5 · Privacitat amb RLS
**Com a** usuària, **vull** que ningú més pugui veure les meves entrades **per** escriure amb tranquil·litat.
- [ ] RLS està activada a `entries`.
- [ ] Les polítiques només permeten `select`, `insert`, `update` i `delete` de files on `user_id = auth.uid()`.
- [ ] Hi ha un test amb dues usuàries que demostra que A no pot llegir, modificar ni esborrar entrades de B.

### E3-H6 · Configuració segura
**Com a** desenvolupadora, **vull** les claus fora del codi **per** no exposar res sensible.
- [ ] L'URL i l'anon key es llegeixen de `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`.
- [ ] `.env` és a `.gitignore` i hi ha un `.env.example`.
- [ ] El workflow de desplegament obté els valors de secrets de GitHub.
- [ ] La service role key no apareix mai al frontend ni al repositori.

---

## Etapa 4 — Tests de punta a punta amb Playwright

### E4-H1 · Entorn de proves aïllat
**Com a** desenvolupadora, **vull** un Supabase local per als tests **per** no tocar dades reals.
- [ ] Els tests E2E corren contra Supabase local (CLI + Docker) amb les migracions del repositori.
- [ ] Un seed crea dues usuàries de prova amb dades conegudes.
- [ ] Cada test parteix d'un estat conegut (neteja o dades pròpies).

### E4-H2 · Fluxos principals coberts
**Com a** desenvolupadora, **vull** tests E2E dels fluxos clau **per** saber que l'aplicació funciona de veritat.
- [ ] Iniciar i tancar sessió (incloses credencials incorrectes).
- [ ] Crear, editar (amb desat automàtic i recàrrega) i esborrar una entrada.
- [ ] Navegar entre dies i comprovar que el futur està bloquejat.
- [ ] Privacitat: l'usuària A no veu les entrades de l'usuària B.

### E4-H3 · Playwright a la CI
**Com a** desenvolupadora, **vull** que la CI executi els E2E **per** bloquejar PR que trenquin fluxos.
- [ ] Un job de GitHub Actions arrenca Supabase local, construeix l'app i executa Playwright.
- [ ] Si falla, l'informe de Playwright es puja com a artefacte.
- [ ] El job és obligatori per fusionar a `main`.

---

## Etapa 5 — Markdown

### E5-H1 · Escriure en markdown
**Com a** usuària, **vull** fer servir markdown **per** donar format (títols, negreta, llistes, enllaços) a les entrades.
- [ ] Cada entrada té mode edició (text pla) i mode lectura (markdown renderitzat).
- [ ] Per defecte, les entrades existents es mostren en mode lectura; les noves s'obren en mode edició.
- [ ] Es pot passar d'un mode a l'altre amb un botó i amb teclat.
- [ ] El desat automàtic continua funcionant en mode edició.

### E5-H2 · Renderitzat segur
**Com a** usuària, **vull** que el markdown no pugui executar codi **per** estar protegida.
- [ ] L'HTML generat es saneja abans d'inserir-lo al DOM.
- [ ] Un test unitari comprova que `<script>`, atributs `on*` i enllaços `javascript:` s'eliminen.

---

## Etapa 6 — Estat d'ànim i etiquetes

### E6-H1 · Estat d'ànim
**Com a** usuària, **vull** indicar com em sento a cada entrada **per** veure'n l'evolució.
- [ ] Cada entrada té un selector opcional d'estat d'ànim de 1 a 5, representat amb emojis (😞 🙁 😐 🙂 😄).
- [ ] Es pot treure l'estat d'ànim d'una entrada.
- [ ] L'estat d'ànim es desa i es mostra en recarregar.
- [ ] A la llista de dies (E1-H6) es veu l'estat d'ànim mitjà del dia.

### E6-H2 · Etiquetes
**Com a** usuària, **vull** posar etiquetes a les entrades **per** agrupar-les per temes.
- [ ] Es poden afegir i treure etiquetes de text lliure a cada entrada.
- [ ] Les etiquetes es normalitzen (minúscules, sense espais als extrems, sense duplicats a la mateixa entrada).
- [ ] En escriure una etiqueta se'n suggereixen d'existents de la mateixa usuària.

### E6-H3 · Filtrar per etiqueta
**Com a** usuària, **vull** veure totes les entrades amb una etiqueta **per** rellegir un tema.
- [ ] Clicar una etiqueta mostra totes les entrades pròpies que la tenen, agrupades per dia.
- [ ] Es pot tornar a la vista normal fàcilment.

### E6-H4 · Esquema i privacitat
**Com a** desenvolupadora, **vull** que els canvis d'esquema mantinguin la privacitat.
- [ ] Els camps nous s'afegeixen amb una migració nova (no editant les antigues).
- [ ] Les taules o columnes noves tenen RLS equivalent a `entries` i el test de privacitat les cobreix.

---

## Etapa 7 — Poliment

### E7-H1 · Cerca
**Com a** usuària, **vull** cercar text a les meves entrades **per** trobar un record concret.
- [ ] Un camp de cerca retorna les entrades pròpies que contenen el text, sense distingir majúscules ni accents.
- [ ] Els resultats mostren el dia, l'hora i un fragment amb el text trobat ressaltat.
- [ ] Clicar un resultat obre el dia corresponent.

### E7-H2 · Exportar
**Com a** usuària, **vull** descarregar les meves entrades **per** tenir-ne una còpia.
- [ ] Es poden exportar totes les entrades pròpies en JSON i en Markdown.
- [ ] L'exportació inclou data, hora, contingut, estat d'ànim i etiquetes.
- [ ] Només s'exporten entrades de la usuària amb sessió.

### E7-H3 · Mòbil i accessibilitat
**Com a** usuària, **vull** fer servir el diari al mòbil i amb teclat **per** escriure des d'on sigui.
- [ ] La interfície funciona sense scroll horitzontal a 360 px d'amplada.
- [ ] Tot es pot fer amb teclat i el focus és visible.
- [ ] Els controls tenen etiquetes accessibles i el contrast compleix WCAG AA.

### E7-H4 · Mode fosc
**Com a** usuària, **vull** un mode fosc **per** escriure de nit sense enlluernar-me.
- [ ] El tema segueix la preferència del sistema per defecte.
- [ ] Es pot canviar manualment i l'elecció es recorda.

### E7-H5 · Estats de càrrega i error
**Com a** usuària, **vull** saber què està passant **per** no dubtar si s'ha desat.
- [ ] Mentre es carreguen dades es mostra un indicador.
- [ ] Els errors de xarxa es mostren amb un missatge comprensible i una opció de reintentar.
