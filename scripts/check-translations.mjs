#!/usr/bin/env node
// Checks public/data/locales/<language>.json against public/data/recipes.json (the Italian source).
//
//   node scripts/check-translations.mjs                    report problems (exit 1 if any)
//   node scripts/check-translations.mjs --stamp <lang> <recipeId>…   mark translations as up to date
//                                                          with the current Italian (after updating them);
//                                                          `--stamp all` stamps every recipe in every language
//   node scripts/check-translations.mjs --hook             Claude Code hook mode: reads the hook payload on
//                                                          stdin, stays silent when all is well, otherwise
//                                                          hands the report to Claude as additional context
//
// Each translated recipe stores `sourceHash`: a fingerprint of the Italian text it was translated from.
// When the Italian text changes, the fingerprint no longer matches and the translation is reported as outdated.

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RECIPES_PATH = join(root, 'public/data/recipes.json')
const LOCALES_DIR = join(root, 'public/data/locales')

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n')

function loadRecipes() {
  const data = readJson(RECIPES_PATH)
  return Array.isArray(data) ? data : data.recipes ?? []
}

function loadLocales() {
  return readdirSync(LOCALES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ language: file.replace(/\.json$/, ''), path: join(LOCALES_DIR, file), data: readJson(join(LOCALES_DIR, file)) }))
}

// Everything a translation depends on: the Italian texts plus the ids they're keyed by
function sourceText(recipe) {
  return {
    title: recipe.title,
    description: recipe.description,
    origin: recipe.origin,
    category: recipe.category,
    notes: recipe.notes ?? null,
    sourceNote: recipe.source?.note ?? null,
    servingsUnit: recipe.servings?.unit ?? null,
    tags: recipe.tags ?? [],
    groups: (recipe.groups ?? []).map((group) => [
      group.id,
      group.name,
      group.ingredients.map((ingredient) => [ingredient.id, ingredient.name, ingredient.substitute?.name ?? null]),
    ]),
    steps: (recipe.steps ?? []).map((step) => [step.id, step.title, step.content]),
    methods: (recipe.cooking?.methods ?? []).map((method) => [
      method.id,
      method.label,
      method.settings?.cookware ?? null,
      method.settings?.heat ?? null,
      method.settings?.rack ?? null,
    ]),
  }
}

const sourceHash = (recipe) => createHash('sha256').update(JSON.stringify(sourceText(recipe))).digest('hex').slice(0, 16)
const refs = (text = '') => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',')

function check() {
  const recipes = loadRecipes()
  const problems = []
  for (const { language, data } of loadLocales()) {
    const translations = data.recipes ?? {}
    for (const recipe of recipes) {
      const translation = translations[recipe.id]
      const where = `${language}/${recipe.id}`
      if (!translation) {
        problems.push(`${where}: no translation (new recipe?)`)
        continue
      }
      if (translation.sourceHash !== sourceHash(recipe)) {
        problems.push(`${where}: outdated — the Italian text changed since it was translated (see \`git diff public/data/recipes.json\`)`)
      }
      const ingredients = (recipe.groups ?? []).flatMap((group) => group.ingredients)
      const ids = {
        groups: new Set((recipe.groups ?? []).map((group) => group.id)),
        ingredients: new Set(ingredients.map((ingredient) => ingredient.id)),
        steps: new Set((recipe.steps ?? []).map((step) => step.id)),
        methods: new Set((recipe.cooking?.methods ?? []).map((method) => method.id)),
      }
      for (const [kind, known] of Object.entries(ids)) {
        const translated = translation[kind] ?? {}
        const missing = [...known].filter((id) => !translated[id])
        const orphaned = Object.keys(translated).filter((id) => !known.has(id))
        // Method labels are optional (they only show when a recipe has several methods)
        if (missing.length && kind !== 'methods') problems.push(`${where}: untranslated ${kind}: ${missing.join(', ')}`)
        if (orphaned.length) problems.push(`${where}: ${kind} no longer in the recipe: ${orphaned.join(', ')}`)
      }
      for (const step of recipe.steps ?? []) {
        const content = translation.steps?.[step.id]?.content
        if (content && refs(content) !== refs(step.content)) {
          problems.push(`${where}: step ${step.id} ingredient refs differ (${refs(content) || 'none'} vs Italian ${refs(step.content) || 'none'})`)
        }
      }
      for (const tag of Object.keys(translation.tags ?? {})) {
        if (!recipe.tags?.includes(tag)) problems.push(`${where}: tag "${tag}" no longer in the recipe`)
      }
    }
    for (const id of Object.keys(translations)) {
      if (!recipes.some((recipe) => recipe.id === id)) problems.push(`${language}/${id}: recipe no longer exists`)
    }
  }
  return problems
}

function stamp(language, recipeIds) {
  const recipes = loadRecipes()
  for (const locale of loadLocales()) {
    if (language !== 'all' && locale.language !== language) continue
    for (const recipe of recipes) {
      const translation = locale.data.recipes?.[recipe.id]
      if (!translation || (language !== 'all' && !recipeIds.includes(recipe.id))) continue
      // Keep sourceHash first so it's easy to spot in the file
      locale.data.recipes[recipe.id] = { sourceHash: sourceHash(recipe), ...translation, sourceHash: sourceHash(recipe) }
      console.log(`stamped ${locale.language}/${recipe.id}`)
    }
    writeJson(locale.path, locale.data)
  }
}

function report(problems) {
  return [
    `Recipe translations need attention (${problems.length} issue${problems.length === 1 ? '' : 's'}):`,
    ...problems.map((problem) => `- ${problem}`),
    '',
    'Update public/data/locales/<language>.json to match public/data/recipes.json (Italian is the source; keep {0001}-style refs),',
    'then run `node scripts/check-translations.mjs --stamp <language> <recipeId>…` for the entries you updated, and re-run the check.',
  ].join('\n')
}

const [mode, ...rest] = process.argv.slice(2)

if (mode === '--stamp') {
  const [language, ...recipeIds] = rest
  if (!language) {
    console.error('usage: --stamp <language|all> <recipeId>…')
    process.exit(2)
  }
  stamp(language, recipeIds)
} else if (mode === '--hook') {
  let payload = {}
  try {
    payload = JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    // No or invalid payload: treat like a session start
  }
  const event = payload.hook_event_name ?? 'SessionStart'
  // After a tool call, only react when it touched recipes.json (Edit/Write path, or a Bash command naming it)
  if (event === 'PostToolUse' && !JSON.stringify(payload.tool_input ?? {}).includes('recipes.json')) process.exit(0)
  let problems
  try {
    problems = check()
  } catch (error) {
    problems = [`could not run the check: ${error.message}`]
  }
  if (problems.length === 0) process.exit(0)
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: report(problems) } }))
} else {
  const problems = check()
  console.log(problems.length ? report(problems) : 'Recipe translations are up to date.')
  process.exit(problems.length ? 1 : 0)
}
