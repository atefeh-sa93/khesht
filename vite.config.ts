/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME, THEME_COLOR, basePath } from './app.config.ts'

// Short commit hash of the build, shown in Settings so a bug report says
// which version is running. BUILD_ID overrides it (tests can use this to
// make two builds of the same commit differ).
function buildId(): string {
  if (process.env.BUILD_ID) return process.env.BUILD_ID
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// Fills %APP_SHORT_NAME%, %APP_DESCRIPTION% and %THEME_COLOR% in index.html,
// so the names live only in app.config.ts.
function appConfigHtml(): Plugin {
  const values: Record<string, string> = { APP_SHORT_NAME, APP_DESCRIPTION, THEME_COLOR }
  return {
    name: 'app-config-html',
    transformIndexHtml: (html) => html.replace(/%(APP_SHORT_NAME|APP_DESCRIPTION|THEME_COLOR)%/g, (_, key: string) => values[key]),
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // Builds and `pnpm preview` use the production base path, so preview
  // behaves exactly like the live site; dev stays at /. (Preview runs as
  // command 'serve', hence isPreview.)
  base: command === 'build' || isPreview ? basePath(process.env.BASE_PATH) : '/',
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    react(),
    tailwindcss(),
    appConfigHtml(),
    VitePWA({
      // A new version waits until the user agrees to reload: an automatic
      // reload could wipe a half-filled form. Registration is done by the
      // useRegisterSW hook in src/pwa/UpdatePrompt.tsx, not injected.
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        // Everything the app needs is precached at install, fonts included,
        // so it opens fully offline from the second visit on. Data never
        // comes from the network, so there is no runtime caching.
        // The manifest is added by the plugin itself.
        globPatterns: ['**/*.{html,js,css,woff2,svg,png,ico}'],
        // Any navigation is answered with the cached app shell. Routes live
        // in the hash, so this mainly covers reloads while offline.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      // globPatterns already precaches every icon; listing them here too
      // would add each one to the precache twice.
      includeManifestIcons: false,
      manifest: {
        id: './',
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        lang: 'fa',
        dir: 'rtl',
        // Relative, so the app installs correctly under any base path,
        // including /<repo-name>/ on GitHub Pages.
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        categories: ['productivity'],
        // Made from public/icon.svg by `pnpm generate-icons`.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
}))
