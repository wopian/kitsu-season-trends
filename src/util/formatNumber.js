const numberFormat = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})
const percentFormat = new Intl.NumberFormat('en-GB', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const formatNumber = (number, isPercent = false) =>
  isPercent ? percentFormat.format(number / 100) : numberFormat.format(number)
