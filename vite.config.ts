/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { basePath } from './app.config.ts'

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
  plugins: [react(), tailwindcss()],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
}))
