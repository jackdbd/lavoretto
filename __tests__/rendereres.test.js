import { describe, expect, it } from '@jest/globals'
import { renderError, renderSuccess } from '../lib/renderers.js'

describe('renderError', () => {
  it('contains the given title, no details and no tips', () => {
    const title = 'Oh no!'
    const details = [`We could not do this`, `We could not do that`]
    const tips = [`Have you tried doing this other thing?`]

    const s = renderSuccess({ title })

    expect(s).toContain(title)
    details.forEach((detail) => {
      expect(s).not.toContain(detail)
    })
    tips.forEach((tip) => {
      expect(s).not.toContain(tip)
    })
  })

  it('contains the given title, details and tips', () => {
    const title = 'Oh no!'
    const details = [`We could not do this`, `We could not do that`]
    const tips = [`Have you tried doing this other thing?`]

    const s = renderError({ title, details, tips })

    expect(s).toContain(title)
    details.forEach((detail) => {
      expect(s).toContain(detail)
    })
    tips.forEach((tip) => {
      expect(s).toContain(tip)
    })
  })
})

describe('renderSuccess', () => {
  it('contains the given title and no details', () => {
    const title = 'Hurrah!'
    const details = [`We did this`, `We did that`]

    const s = renderSuccess({ title })

    expect(s).toContain(title)
    details.forEach((detail) => {
      expect(s).not.toContain(detail)
    })
  })

  it('contains the given title and details', () => {
    const title = 'Hurrah!'
    const details = [`We did this`, `We did that`]

    const s = renderSuccess({ title, details })

    expect(s).toContain(title)
    details.forEach((detail) => {
      expect(s).toContain(detail)
    })
  })
})
