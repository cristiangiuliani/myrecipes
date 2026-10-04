import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the favicon, PWA and Apple icons from public/logo.svg:
//   yarn generate-pwa-assets
// Maskable and Apple icons can't be transparent, so they get the logo's blue as background.
const background = '#1976d2'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/logo.svg'],
})
