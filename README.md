# My Recipes

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

## Deployment

Every push to `main` is built and deployed to Firebase Hosting automatically by `.github/workflows/firebase-hosting-merge.yml`. There's no manual deploy step — see `CLAUDE.md` for the required GitHub repo secrets.
