/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // The first unit tests arrive with the i18n and date helpers (#4, #5).
    passWithNoTests: true,
  },
})
