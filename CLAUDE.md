# My Recipes

React + TypeScript recipe browser. Local dev on Vite, deployed to Firebase. Recipe data starts as a single JSON file and may migrate to per-recipe files or a database later — code must not assume the current storage shape leaks past the data layer.

## Tech stack

- React 19 + TypeScript, built with Vite
- **Package manager: Yarn 4 (Berry) in PnP mode** — not npm, not node_modules linker. Use `yarn add`/`yarn dlx`, not `npm install`/`npx`.
- UI framework: **MUI** (`@mui/material`, Emotion, `@mui/icons-material`). Prefer MUI components over hand-rolled CSS for inputs, chips, sliders, dialogs, etc.
- Routing: `react-router-dom`
- Backend: Firebase (config in `src/firebase/config.ts`, values from `VITE_FIREBASE_*` env vars in `.env.local`, never committed)

## Architecture

Layered separation of concerns — each layer only talks to the one below it:

1. **Data layer** — a repository abstraction hides where recipe data comes from (JSON today, per-recipe files or a real database later). Nothing outside this layer calls `fetch`/Firestore directly.
2. **Domain/logic layer** — plain TypeScript, no React. Servings-scaling math, quantity rounding/formatting, rewriting `{0003}`-style ingredient placeholders in step text. Pure and unit-testable.
3. **State layer** — custom hooks (`useRecipes`, `useRecipe`, `useScaledRecipe`) call the data layer and expose data/loading/error state. Components never call the repository directly.
4. **Presentation layer** — "dumb" components (pure props → JSX) vs. page components that wire hooks + dumb components together.
5. **Routing layer** — route definitions kept separate from page implementations.

### Folder structure (feature-based, not type-based)

```
src/
  app/                  # App shell: routes, providers, layout
    App.tsx
    routes.tsx
  features/
    recipes/
      api/              # repository: recipes.repository.ts (JSON now, DB later)
      hooks/            # useRecipes, useRecipe
      components/       # RecipeCard, RecipeList, RecipeDetail (dumb components)
      pages/            # RecipeListPage, RecipeDetailPage (wire hooks + components)
      scaling/          # pure scaling/formatting logic + useScaledRecipe
      filters/          # tag/category filter state + components
      types.ts          # Recipe, Ingredient, Step, etc.
      index.ts          # public barrel: types + pages used by app/routes.tsx
  shared/
    components/         # generic reusable UI (not recipe-specific)
    lib/                 # generic utilities (formatting, etc.)
  firebase/
    config.ts
```

Each feature exposes a small `index.ts` barrel; import `from '@/features/recipes'` rather than reaching into feature internals. Use path aliases (`@/...`) instead of relative `../../../` chains.

## State management

- **Filters, search, active tags → URL search params** (`react-router`'s `useSearchParams`), not a state library. Shareable/bookmarkable and survives refresh for free.
- **React Context**: fine for one-off, rarely-changing concerns (e.g. theme mode). Avoid it as a general-purpose store — every consumer re-renders on any change unless contexts are split carefully.
- **Zustand**: the fallback if something needs genuine cross-component shared state that doesn't belong in the URL (e.g. a "recently viewed" list). Not adopted yet — the app is still small enough that this hasn't come up. Decide when the need actually appears, don't pre-adopt it.

## Recipe data model (from `public/data/recipes.json`)

- `Recipe`: `id`, `title`, `description`, `origin`, `category`, `tags[]`, `servings: { amount, unit }` (unit isn't always "persone" — e.g. "girelle", "fette", "stampo"), `prepTimeMinutes`/`restTimeMinutes`/`cookTimeMinutes`/`totalTimeMinutes`, `groups[]`, `steps[]`, `oven`, `notes`, `source`.
- `groups[]`: named ingredient sections (`id`, `name`, `ingredients[]`).
- `Ingredient`: `id`, `name`, `amount`, `unit`, optional `optional: true`, optional `substitute: { name, amount, unit }`.
- `steps[]`: `id`, `group`, `title`, `content` (embeds `{0003}`-style ingredient refs inline), `ingredientRefs[]`, `timerSeconds`.
- Because `servings.unit` isn't always people, the servings/scaling control should default to a plain multiplier (×1.5, ×2, ÷2) with a "servings" input mode only when the unit is people-like. Scaling must update both the ingredient list and the inline `{ref}` quantities inside step text, and needs sensible rounding for countable units (`pz`, `tsp`, etc.) vs. weight/volume units (`g`, `ml`).

## Testing

Add Vitest for the scaling/formatting logic specifically — that's the part with real edge cases (rounding, pieces vs. grams, `{ref}` substitution).

## Deployment

- Firebase Hosting, project `my-recipe-cards-bbaec` (see `.firebaserc`/`firebase.json`, hosting `public` dir is `dist`, with a SPA rewrite to `index.html` since routing is client-side via `react-router-dom`).
- `.github/workflows/firebase-hosting-merge.yml` builds and deploys to Hosting on every push to `main`.
- **Auth: Workload Identity Federation, not a service account JSON key.** The Google Cloud org this project sits under enforces `iam.disableServiceAccountKeyCreation`, so downloadable keys aren't an option — and WIF is the better approach anyway (no long-lived secret stored in GitHub at all). This mirrors the working setup in `/Users/cristiangiuliani/Projects/cristiangiuliani` (`.github/workflows/firebase-hosting.yml`): a Workload Identity Pool + OIDC provider scoped to this exact repo, impersonating a service account with Hosting deploy rights, via `google-github-actions/auth`.
- One-time GCP setup required (see README for the exact `gcloud` commands) before the workflow can succeed: a Workload Identity Pool/Provider and a `github-firebase@my-recipe-cards-bbaec.iam.gserviceaccount.com` service account with `roles/firebasehosting.admin`, restricted to `cristiangiuliani/myrecipes` via the provider's attribute condition.
- GitHub repo secrets still needed (Settings → Secrets and variables → Actions) — just the six `VITE_FIREBASE_*` values (same as `.env.local`), so the production build gets the real Firebase config baked in. No `FIREBASE_SERVICE_ACCOUNT` secret.
- Deploys are push-triggered only — do not add manual/local `firebase deploy` as the standard path; CI is the source of truth for what's live.
