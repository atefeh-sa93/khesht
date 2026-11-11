import { describe, expect, it } from 'vitest'
import { BASE_PATH, basePath } from '../../app.config.ts'

describe('basePath', () => {
  it('uses BASE_PATH when the variable is not set', () => {
    expect(basePath(undefined)).toBe(BASE_PATH)
    expect(basePath('')).toBe(BASE_PATH)
  })

  it('uses the variable when it is set', () => {
    expect(basePath('/my-app/')).toBe('/my-app/')
  })

  it('rejects a path without leading and trailing slashes', () => {
    expect(() => basePath('my-app/')).toThrow(/BASE_PATH/)
    expect(() => basePath('/my-app')).toThrow(/BASE_PATH/)
  })
})
