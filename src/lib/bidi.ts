// Unicode bidirectional isolates for plain text. Where an element can be
// used, prefer <Num> / <Nums> from src/ui/Num.tsx, which wrap each number in
// a <bdi>. This is for places that only take a string: aria-label, title,
// document.title, notifications.

const FSI = '⁨' // FIRST STRONG ISOLATE: starts an isolated run
const PDI = '⁩' // POP DIRECTIONAL ISOLATE: ends it

/**
 * Wraps text in invisible isolate marks, the plain-text twin of <bdi>, so
 * it is laid out on its own and never merges with its neighbours. Isolate
 * each number separately: `${isolateText(a)}/${isolateText(b)}`.
 */
export function isolateText(text: string): string {
  return `${FSI}${text}${PDI}`
}
