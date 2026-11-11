import { Fragment, type ReactNode } from 'react'
import { useSettings } from '../app/settings.ts'
import type { Locale } from '../lib/locale.ts'
import { formatDigits, formatNumber, formatPercent } from '../lib/numbers.ts'

// Why this exists: in right-to-left text, two numbers joined by a separator
// with no spaces (/ : , . - ، ٬) form one left-to-right run, and the browser
// shows them in reverse order. Persian digits behave the same as Latin ones.
// "3 of 10" written ۳/۱۰ as plain text shows the 10 on the right, where a
// Persian reader starts. Putting each number in its own <bdi> isolates it,
// so the order follows the text direction in both languages. (Spaces and the
// en dash happen to be safe in Chrome today; isolating is safe everywhere.)
//
//   <Num value={1250} />                          ۱٬۲۵۰
//   <Nums values={[3, 10]} separator="/" />       ۳/۱۰, the 3 on the right
//   <Nums values={[12, 30]} separator="–" />      ۱۲–۳۰
//
// Not for one value that has its own order, like a date (۱۴۰۵/۰۸/۲۰) or a
// time (۱۲:۳۰): format that as one string. For strings that cannot hold
// elements (aria-label, title) use isolateText() from src/lib/bidi.ts.

export type NumFormat = 'number' | 'digits' | 'percent'

const formatters: Record<NumFormat, (value: number, locale: Locale) => string> = {
  number: formatNumber, // "۱۲٬۵۰۰": grouped
  digits: formatDigits, // "۱۴۰۵": no separators, for years and ids
  percent: formatPercent, // 0.18 as "۱۸٪"
}

interface NumProps {
  value: number
  format?: NumFormat
  /** Defaults to the UI language from settings. */
  locale?: Locale
  className?: string
}

/** One number in the locale's digits, isolated in its own <bdi>. */
export function Num({ value, format = 'number', locale, className }: NumProps) {
  const settings = useSettings()
  return <bdi className={className}>{formatters[format](value, locale ?? settings.locale)}</bdi>
}

interface NumsProps extends Omit<NumProps, 'value'> {
  values: readonly number[]
  /** Text or element placed between the numbers, outside the isolates. */
  separator: ReactNode
}

/** Several numbers next to each other, each in its own <bdi>. */
export function Nums({ values, separator, ...numProps }: NumsProps) {
  return values.map((value, i) => (
    <Fragment key={i}>
      {i > 0 && separator}
      <Num value={value} {...numProps} />
    </Fragment>
  ))
}
