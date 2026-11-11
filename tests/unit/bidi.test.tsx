import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { getSettings } from '../../src/app/settings.ts'
import { isolateText } from '../../src/lib/bidi.ts'
import { formatNumber } from '../../src/lib/numbers.ts'
import { Num, Nums } from '../../src/ui/Num.tsx'

const html = (node: ReactNode) => renderToStaticMarkup(node)

describe('Num', () => {
  it('wraps one number in a <bdi> with the locale digits', () => {
    expect(html(<Num value={1250} locale="fa" />)).toBe('<bdi>۱٬۲۵۰</bdi>')
    expect(html(<Num value={1250} locale="en" />)).toBe('<bdi>1,250</bdi>')
  })

  it('supports ungrouped digits and percents', () => {
    expect(html(<Num value={1405} format="digits" locale="fa" />)).toBe('<bdi>۱۴۰۵</bdi>')
    expect(html(<Num value={0.18} format="percent" locale="fa" />)).toBe('<bdi>۱۸٪</bdi>')
  })

  it('passes the class name on', () => {
    expect(html(<Num value={3} locale="en" className="font-bold" />)).toBe('<bdi class="font-bold">3</bdi>')
  })

  it('uses the UI language when no locale is given', () => {
    expect(html(<Num value={7} />)).toBe(`<bdi>${formatNumber(7, getSettings().locale)}</bdi>`)
  })
})

describe('Nums', () => {
  it('puts each number in its own <bdi>, with the separator outside', () => {
    expect(html(<Nums values={[3, 10]} separator="/" locale="fa" />)).toBe('<bdi>۳</bdi>/<bdi>۱۰</bdi>')
    expect(html(<Nums values={[12, 30]} separator="–" locale="fa" />)).toBe('<bdi>۱۲</bdi>–<bdi>۳۰</bdi>')
  })

  it('never puts two numbers in the same element', () => {
    const markup = html(<Nums values={[120, 80, 4]} separator=" × " locale="en" />)
    expect(markup).toBe('<bdi>120</bdi> × <bdi>80</bdi> × <bdi>4</bdi>')
    expect(markup.match(/<bdi>/g)).toHaveLength(3)
  })

  it('accepts an element as the separator', () => {
    expect(html(<Nums values={[3, 10]} separator={<span> از </span>} locale="fa" />)).toBe(
      '<bdi>۳</bdi><span> از </span><bdi>۱۰</bdi>',
    )
  })

  it('renders a single number without a separator, and nothing for none', () => {
    expect(html(<Nums values={[5]} separator="–" locale="en" />)).toBe('<bdi>5</bdi>')
    expect(html(<Nums values={[]} separator="–" locale="en" />)).toBe('')
  })
})

describe('isolateText', () => {
  it('wraps text in first-strong-isolate and pop-isolate marks', () => {
    expect(isolateText('۱۲')).toBe('⁨۱۲⁩')
  })

  it('keeps two isolated numbers apart in a plain string', () => {
    const label = `${isolateText('۱۲')}–${isolateText('۳۰')}`
    expect([...label]).toEqual(['⁨', '۱', '۲', '⁩', '–', '⁨', '۳', '۰', '⁩'])
  })
})
