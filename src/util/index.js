export function year(date = new Date()) {
  return new Date(date).getFullYear()
  // December 2016 is 2017-winter
  // if (season() === 'winter' && new Date().getMonth() + 1 === 12) year++
}

export function season(date = new Date()) {
  if (date === null) return null
  switch (new Date(date).getMonth()) {
    case 0:
    case 1:
    case 2:
      return 'winter'
    case 3:
    case 4:
    case 5:
      return 'spring'
    case 6:
    case 7:
    case 8:
      return 'summer'
    case 9:
    case 10:
    case 11:
      return 'autumn'
  }
}

export function seasonUSFormat(date = new Date()) {
  const output = season(date)
  return output === 'autumn' ? 'fall' : output
}

export function previousSeason({ s, y }) {
  switch (s) {
    case 'winter':
      return { s: 'autumn', y: --y }
    case 'spring':
      return { s: 'winter', y }
    case 'summer':
      return { s: 'spring', y }
    case 'autumn':
      return { s: 'summer', y }
  }
}

export function nextSeason({ s, y }) {
  switch (s) {
    case 'winter':
      return { s: 'spring', y }
    case 'spring':
      return { s: 'summer', y }
    case 'summer':
      return { s: 'autumn', y }
    case 'autumn':
      return { s: 'winter', y: ++y }
  }
}

export function sort(data, by, exclude = new Set()) {
  return Object.values(data)
    .sort((A, B) => {
      let a = null,
        b = null

      if (by === 'r') {
        a = A.d.slice(-1)[0][by] / A.d.slice(-1)[0].u
        b = B.d.slice(-1)[0][by] / B.d.slice(-1)[0].u
      } else {
        a = A.d.slice(-1)[0][by]
        b = B.d.slice(-1)[0][by]
      }

      return a > b ? -1 : a < b ? 1 : 0
    })
    .filter(({ u, n }) => {
      const toFilter = []
      if (u === 'TV') toFilter.push('tv')
      if (u === 'ONA') toFilter.push('ona')
      if (n === 1) toFilter.push('new')
      if (n === 0) toFilter.push('old')

      // u: TV/ONA
      // n: 0/1 old/new
      const filterable = new Set([
        u === 'TV' ? 'tv' : 'ona',
        n === 1 ? 'new' : 'old'
      ])

      const diff = [...exclude].filter(x => filterable.has(x))
      return diff.length > 0 ? false : true
    })
}
