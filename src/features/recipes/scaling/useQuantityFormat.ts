import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/shared/i18n'
import type { QuantityFormat } from './formatQuantity'

// Only plain unit names are looked up; anything else (free text) is shown as written
const UNIT_KEY_PATTERN = /^[\p{L}\d-]+$/u

export function useQuantityFormat(): QuantityFormat {
  const { t } = useTranslation()
  const language = useLanguage()
  return useMemo(
    () => ({
      locale: language,
      unitLabel: (unit, count) =>
        UNIT_KEY_PATTERN.test(unit) ? t(`units.${unit}`, { count, defaultValue: unit }) : unit,
      asNeeded: t('quantity.asNeeded'),
    }),
    [t, language],
  )
}
