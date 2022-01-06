import { format, isBefore, startOfMonth, subMonths } from 'date-fns'

const SEASONS = {
  WINTER: 'winter',
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn'
}

export const removeLocale = (date = new Date()) => {
  return format(
    new Date(date.valueOf() + date.getTimezoneOffset() * -1 * 60 * 1000),
    'yyyy-MM-dd'
  )
}

const year = (date = new Date()) => new Date(date).getFullYear()

const season = (date = new Date()) => {
  if (date === null) return null
  switch (startOfMonth(new Date(date)).getMonth()) {
    case 0:
    case 1:
    case 2:
      return SEASONS.WINTER
    case 3:
    case 4:
    case 5:
      return SEASONS.SPRING
    case 6:
    case 7:
    case 8:
      return SEASONS.SUMMER
    case 9:
    case 10:
    case 11:
      return SEASONS.AUTUMN
  }
}

export const currentSeason = (date = new Date()) => {
  const current = startOfMonth(new Date(date))
  return {
    year: year(current),
    season: season(current),
    rawDate: current
  }
}

export const previousSeason = (date = new Date()) =>
  currentSeason(subMonths(new Date(date), 3))

export const currentTime = () =>
  format(new Date(), 'yyyy-MM-dd HH:mm:ssXXXX (z)')

export const didStartPreviousSeason = date =>
  startOfMonth(new Date(date)) >= subMonths(startOfMonth(new Date()), 3)

export const finishedBeforeSeasonStart = (type, date) =>
  isBefore(
    currentSeason(date ?? new Date()).rawDate,
    (type === 'current' ? currentSeason() : previousSeason()).rawDate
  )

export const startsBeforeSeasonStart = (type, date) =>
  finishedBeforeSeasonStart(type, date)
