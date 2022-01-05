import { green, blue, yellow, magenta } from 'yoctocolors'

export const log = (label, message) => {
  const formattedLabel = label.toUpperCase().padStart(8)
  let colouredLabel = null
  switch (label) {
    case 'info':
      colouredLabel = blue(formattedLabel)
      break
    case 'current':
      colouredLabel = green(formattedLabel)
      break
    case 'previous':
      colouredLabel = yellow(formattedLabel)
      break
    case 'shared':
      colouredLabel = magenta(formattedLabel)
      break
  }
  console.log(`${colouredLabel}: ${message}`)
}