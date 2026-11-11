// Settings a project made from this template is most likely to change.
// Kept in one file so the build, the PWA manifest and the E2E tests agree.
// No Node dependencies: the app itself imports this file too.

/**
 * Short, stable id of the app: lowercase letters, digits and dashes. It
 * prefixes the localStorage keys and later names the IndexedDB database and
 * tags backup files. Change it once, before real users have data: data saved
 * under the old id is not carried over.
 */
export const APP_ID = 'khesht'

/**
 * Calendar used until the user picks one in settings, in both languages.
 * Dates are always stored as ISO Gregorian, so changing this only changes
 * how they are shown.
 */
export const DEFAULT_CALENDAR: 'jalali' | 'gregorian' = 'jalali'

/**
 * Path the app is served from in production. GitHub Pages serves a project
 * site from /<repo-name>/. The deploy workflow passes BASE_PATH built from
 * the repository name, so a copy made with "Use this template" works without
 * editing this; the value here is for local builds, preview and E2E tests.
 */
export const BASE_PATH = '/khesht/'

/**
 * The base path to build with: the BASE_PATH environment variable when it
 * is set, BASE_PATH otherwise. The caller passes the variable, so this file
 * has no Node dependency and unit tests can import it.
 */
export function basePath(env: string | undefined): string {
  const path = env || BASE_PATH
  if (!path.startsWith('/') || !path.endsWith('/')) {
    throw new Error(`BASE_PATH must start and end with "/", got "${path}"`)
  }
  return path
}
