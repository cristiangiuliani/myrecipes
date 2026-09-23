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

## Project structure

- `src/components` — reusable UI components
- `src/pages` — top-level routed views
- `src/hooks` — custom React hooks
- `src/types` — shared TypeScript types
- `src/lib` — utilities and helpers
- `src/firebase` — Firebase app configuration
- `public/data` — recipe JSON data files
