# Diari

Diari web senzill: cada dia hi pots escriure diverses entrades.

**Adreça pública:** https://victoriapenya.github.io/diari/

## Executar-lo en local

Cal Node.js 20.19 o superior i npm.

```sh
npm ci            # instal·la les dependències exactes de package-lock.json
npm run dev       # servidor de desenvolupament a http://localhost:5173/diari/
```

Altres ordres:

```sh
npm run lint      # comprova l'estil del codi amb ESLint
npm test          # tests unitaris amb Vitest
npm run build     # construeix la versió de producció a dist/
npm run preview   # serveix dist/ en local per provar la versió construïda
```

## CI i desplegament

- **CI** (`.github/workflows/ci.yml`): a cada PR i a cada push a `main` executa `npm ci`, `npm run lint`, `npm test` i `npm run build`.
- **Desplegament** (`.github/workflows/deploy.yml`): a cada push a `main` construeix l'aplicació i la publica a GitHub Pages.
