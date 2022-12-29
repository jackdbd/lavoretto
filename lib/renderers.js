import c from 'ansi-colors'

export const renderError = ({ title, details, tips }) => {
  let s = `${c.symbols.cross} ${title}`

  if (details && details.length > 0) {
    s = s.concat(`\n\nDetails:\n`)
    s = s.concat(details.map((detail) => `- ${detail}`).join('\n'))
  }

  if (tips && tips.length > 0) {
    s = s.concat(`\n\nTips:\n`)
    s = s.concat(tips.map((tip) => `- ${tip}`).join('\n'))
  }

  return c.red(s)
}

export const renderSuccess = ({ title, details }) => {
  let s = `${c.symbols.check} ${title}`

  if (details && details.length > 0) {
    s = s.concat(`\n\nDetails:\n`)
    s = s.concat(details.map((detail) => `- ${detail}`).join('\n'))
  }

  return c.green(s)
}
