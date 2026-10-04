# Ricette di Famiglia

A React + TypeScript app for browsing recipes from JSON data, built with Vite and deployed to Firebase.

## Getting started

```sh
yarn install
yarn dev
```

Copy `.env.example` to `.env.local` and fill in your Firebase project config.

## Scripts

- `yarn dev` — start the local dev server
- `yarn build` — type-check and build for production
- `yarn preview` — preview the production build locally
- `yarn lint` — run Oxlint

## Architecture

The app is organized as layers, each only talking to the one below it:

1. **Data layer** — a repository that hides where recipe data comes from (a single JSON file today, per-recipe files or a database later).
2. **Domain/logic layer** — plain TypeScript, no React: servings-scaling math, quantity formatting, ingredient placeholder substitution in step text.
3. **State layer** — custom hooks (`useRecipes`, `useRecipe`, `useScaledRecipe`) that call the data layer and expose state to components.
4. **Presentation layer** — "dumb" components vs. page components that wire hooks and dumb components together.
5. **Routing layer** — route definitions kept separate from page implementations.

Folders are grouped by feature rather than by type:

```
src/
  app/                  # App shell: routes, providers, layout
  features/
    recipes/
      api/              # data repository (JSON now, DB later)
      hooks/            # useRecipes, useRecipe
      components/       # RecipeCard, RecipeList, RecipeDetail
      scaling/          # servings/quantity scaling logic
      filters/          # tag/category filter state + components
      types.ts
  shared/
    components/         # generic reusable UI
    lib/                 # generic utilities
  firebase/
    config.ts
```

**State management**: filters/search/tags live in the URL (`useSearchParams`), not in a state library. Context is reserved for one-off concerns like theme; a lightweight store (Zustand) is the fallback if genuine cross-component shared state comes up later.

See `CLAUDE.md` for the full architecture rationale and the recipe data model.

`public/data` holds the recipe JSON data files.

**Recipe photos**: drop a JPEG named after the recipe id into `public/images/recipes/`, e.g. `public/images/recipes/burrito-001.jpg` (landscape, roughly 16:9, ~1600px wide is plenty). It shows up in the recipe card and at the top of the recipe page. Recipes without a photo show a placeholder in the same spot.

## Languages

The app is available in Italian (default), English and Dutch — pick one from the header menu; the choice is remembered on the device.

- **App text** (buttons, labels, units, cooking descriptions) lives in `src/shared/i18n/locales/{it,en,nl}.ts`.
- **Recipe text**: `public/data/recipes.json` is written in Italian and stays the single source for amounts, timers and settings. Translations live in one file per language, `public/data/locales/en.json` and `public/data/locales/nl.json`, keyed by recipe id. They only hold text, referenced by the recipe's existing ids, and anything left out — a field, a recipe, or the whole file — shows in Italian. Minimal example (`public/data/locales/en.json`):

```json
{
  "language": "en",
  "recipes": {
    "burrito-001": {
      "title": "…",
      "groups": { "meat": "Meat" },
      "ingredients": { "0001": { "name": "00 flour" }, "0002": { "name": "lard", "substitute": "softened butter" } },
      "steps": { "s1": { "title": "Cook the meat", "content": "Put the beef ({0006}) in a large pot…" } },
      "methods": { "stovetop": { "label": "Frying pan" } }
    }
  }
}
```

Keep the `{0006}`-style ingredient references in translated step text so quantities still scale. Each translated recipe carries a `sourceHash` (a fingerprint of the Italian it was translated from): `yarn check-translations` lists missing or outdated translations whenever `recipes.json` changes, and `node scripts/check-translations.mjs --stamp <language> <recipeId>` marks an updated one as current. Adding a language means a new dictionary in `src/shared/i18n/locales/`, an entry in `LANGUAGES`, and (optionally) a `public/data/locales/<code>.json`. See `CLAUDE.md` for every field.

## Installable app (PWA)

The app is a Progressive Web App (via `vite-plugin-pwa`, configured in `vite.config.ts`): it can be installed on the home screen ("Aggiungi a schermata Home" on iOS Safari, "Installa app" on Android/desktop Chrome) and works offline. The app shell is precached; recipe data is network-first with an offline fallback; photos and fonts are cached as they're viewed. New deploys activate automatically on the next app load.

Icons are generated from `public/logo.svg` — after changing the logo, run `yarn generate-pwa-assets` and commit the regenerated PNGs/ICO in `public/`. The service worker is only built in production (`yarn build && yarn preview` to try it locally).

## Deployment

Every push to `main` is built and deployed to Firebase Hosting (site `ricette-di-famiglia` → https://ricette-di-famiglia.web.app, inside project `my-recipe-cards-bbaec`) automatically by `.github/workflows/firebase-hosting-merge.yml`. There's no manual deploy step.

Auth uses **Workload Identity Federation** instead of a service account key (the GCP org blocks key creation via `iam.disableServiceAccountKeyCreation`). This has already been provisioned for `my-recipe-cards-bbaec` (project number `238961387709`) — kept here for reference and in case it ever needs to be redone (e.g. a new project or repo):

```sh
PROJECT_ID=my-recipe-cards-bbaec
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
REPO=cristiangiuliani/myrecipes

# APIs needed for WIF + the service account
gcloud services enable iamcredentials.googleapis.com --project="$PROJECT_ID"

# Workload Identity Pool + OIDC provider, scoped to this exact repo
gcloud iam workload-identity-pools create "github-pool" \
  --project="$PROJECT_ID" --location="global" --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="github-pool" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$REPO'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Deploy service account with Hosting deploy rights
gcloud iam service-accounts create github-firebase \
  --project="$PROJECT_ID" --display-name="GitHub Actions Firebase deployer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-firebase@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/firebasehosting.admin"

# Let only this repo (via the provider) impersonate that service account
gcloud iam service-accounts add-iam-policy-binding \
  "github-firebase@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO}"
```

Then put the real `PROJECT_NUMBER` into `workload_identity_provider` in `.github/workflows/firebase-hosting-merge.yml` (currently a `PROJECT_NUMBER` placeholder). This mirrors the working setup in the `cristiangiuliani` portfolio project.

GitHub repo secrets still needed (Settings → Secrets and variables → Actions) — the six `VITE_FIREBASE_*` values from `.env.local`, so the production build has the real Firebase config. No service-account secret is needed.
