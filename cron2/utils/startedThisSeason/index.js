import { seasonStart, firstDayOfSeason, firstDayOfNextSeason, UTC } from '../'

export function startedThisSeason (date, { season, year }) {
  const lowerBounds = seasonStart(firstDayOfSeason(season, year))//.toValueOf()
  const upperBounds = firstDayOfNextSeason(season, year)//.toValueOf()
  const started = new UTC(date)//.toValueOf()
  return started >= lowerBounds && started < upperBounds
}
