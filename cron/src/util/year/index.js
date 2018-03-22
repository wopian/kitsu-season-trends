export function year (date = new Date()) {
  return new Date(date).getFullYear()
  // December 2016 is 2017-winter
  // if (season() === 'winter' && new Date().getMonth() + 1 === 12) year++
}
