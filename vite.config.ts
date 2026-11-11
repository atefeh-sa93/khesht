/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { basePath } from './app.config.ts'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // Builds and `pnpm preview` use the production base path, so preview
  // behaves exactly like the live site; dev stays at /. (Preview runs as
  // command 'serve', hence isPreview.)
  base: command === 'build' || isPreview ? basePath(process.env.BASE_PATH) : '/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
}))
