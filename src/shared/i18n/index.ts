import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { en } from './locales/en'
import { it } from './locales/it'
import { nl } from './locales/nl'

export const LANGUAGES = [
  { code: 'it', label: 'Italiano' },
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

// Recipes are written in Italian, so that's the default rather than the browser language;
// the user's pick is remembered per device
const DEFAULT_LANGUAGE: Language = 'it'
const STORAGE_KEY = 'language'

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value)
}

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Storage blocked (private mode): the choice just isn't remembered
  }
})

void i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
    nl: { translation: nl },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: LANGUAGES.map((language) => language.code),
  interpolation: { escapeValue: false }, // React already escapes
})

export function useLanguage(): Language {
  const { i18n: instance } = useTranslation()
  return isLanguage(instance.resolvedLanguage) ? instance.resolvedLanguage : DEFAULT_LANGUAGE
}

export function setLanguage(language: Language) {
  void i18n.changeLanguage(language)
}

export { i18n }
