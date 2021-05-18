import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import fromNow from 'fromnow'
import { IconContext } from 'react-icons'
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom'
import { decode } from 'msgpack-lite/lib/decode'
import { season as s, year as y, prevSeason, nextSeason, sort } from './util'
import { Header } from './components/Header'
import '../styles/index.styl'
import loadable from '@loadable/component'

const Stats = loadable(() => import('./components/Stats'))
const TrendContainer = loadable(() => import('./components/TrendContainer'))

let thisApp = {}
let data = []
let sortedData = []
let meta = {}
let updated = ''
let collectionStartDate = Number.MAX_SAFE_INTEGER
let error = false
let sortOrder = 'm'
let filters = {
  tv: true,
  ona: true,
  new: true,
  old: false
}

function reset () {
  data = []
  sortedData = []
  meta = {}
  error = false
  collectionStartDate = Number.MAX_SAFE_INTEGER
  thisApp.forceUpdate()
}

function sortData ({ by = sortOrder, update = true, filter = null }) {
  if (filter) filters[filter] = !filters[filter]
  const exclude = Object.keys(filters).filter(hi => filters[hi] === false)
  sortOrder = by
  sortedData = sort(data, by, new Set(exclude))
  if (update) thisApp.forceUpdate()
}

function getData (year = y(), season = s()) {
  fetch(`/msgpack/${year}-${season}.msgpack`, {
    method: 'get'
  })
  .then(res => {
    if(res.ok) return res.arrayBuffer()
    else throw new Error(404)
  })
  .then(res => {
    const buffer = new Uint8Array(res);
    ({ data, meta, updated } = decode(buffer))

    for (let show in data) {
      // 0: TV, 1: ONA, >1: ???
      data[show].u = data[show].u === 0 ? 'TV' : 'ONA'

      for (let date in data[show].d) {
        // Add 0 values
        if (!data[show].d[date].p) data[show].d[date].p = 0
        if (!data[show].d[date].o) data[show].d[date].o = 0
        if (!data[show].d[date].u) data[show].d[date].u = 0
        if (!data[show].d[date].w) data[show].d[date].w = 0
        if (!data[show].d[date].a) data[show].d[date].a = 0
        if (!data[show].d[date].m) data[show].d[date].m = 0

        // Convert hours since epoch into milliseconds
        data[show].d[date].d = data[show].d[date].d * 36e5

        // Get the oldest date value from data collection
        if (data[show].d[date].d < collectionStartDate) {
          collectionStartDate = data[show].d[date].d
        }

        // FIX: Counter in JSON:API request for total users appears to be frozen in time as of May 2021
        //      Use the total upvotes/downvotes as a temporary means of tracking the user growth
        data[show].d[date].u = data[show].d[date].p + data[show].d[date].o
        data[show].d[date].r = data[show].d[date].u
      }
    }
  })
  .then(() => {
    sortData({ by: 'w', update: false })
    thisApp.forceUpdate()
  })
  .catch(e => {
    error = e.message
    data = []
    sortedData = []
    thisApp.forceUpdate()
  })
}

function SortButton ({ by, label }) {
  const active = classnames({ active: sortOrder === by })
  return (
    <button onClick={() => sortData({ by })} className={active}>
      {label}
    </button>
  )
}

SortButton.propTypes = {
  by: PropTypes.oneOf([ 'w', 'p', 'o', 'u' ]),
  label: PropTypes.string
}

function FilterButton ({ filter, label }) {
  const active = classnames({ active: filters[filter] === true })
  return (
    <button onClick={() => sortData({ filter })} className={active}>
      {label}
    </button>
  )
}

FilterButton.propTypes = {
  filter: PropTypes.oneOf([ 'tv', 'ona', 'new', 'old' ]),
  label: PropTypes.string
}

function Bar () {
  return (
    <div className='bar'>
      <div>
        <div className='bar-sorts'>
          <span>Sort</span>
          <SortButton by='w' label='Rating'/>
          <SortButton by='p' label='Upvotes'/>
          <SortButton by='o' label='Downvotes'/>
          <SortButton by='u' label='Users'/>
        </div>
        <div className='bar-filters'>
          <span>Filter</span>
          <FilterButton filter='tv' label='TV'/>
          <FilterButton filter='ona' label='ONA'/>
          <FilterButton filter='new' label='New'/>
          <FilterButton filter='old' label='Leftovers'/>
        </div>
        <span className='info'>Airing anime during this season, updated {updated ? fromNow(updated, { max: 1, suffix: true }) : 'daily'}</span>
      </div>
    </div>
  )
}

function SeasonLink ({ season, year, direction }) {
  const options = {
    s: season || s(),
    y: ~~(year || y())
  }
  const { s: toSeason, y: toYear } = direction === 'next' ? nextSeason(options) : prevSeason(options)
  const linkText = direction === 'next' ? 'Next season' : 'Last season'

  return (
    <Link
      className={`link ${direction}`}
      to={`/${toYear}/${toSeason}`}
      onClick={reset}
    >
      {linkText}
    </Link>
  )
}

SeasonLink.propTypes = {
  season: PropTypes.string,
  year: PropTypes.string,
  direction: PropTypes.string
}

function Container ({ match }) {
  const { year, season } = match.params
  const isCurrentSeason = year === y().toString() && season === s()
  let output = {}

  if (data.length > 0 && Object.keys(sortedData).length > 0 && !error) {
    output = sortedData.map((entry, index) => {
      return <TrendContainer
        key={index}
        rank={++index}
        id={entry.i}
        title={entry.t}
        data={entry.d}
        start={collectionStartDate}
        newAnime={typeof entry.n === 'number' ? entry.n : 1}
        isCurrentSeason={isCurrentSeason}
      />
    })
  } else if (error) {
    console.warn(error)
    output = <>
      <p>Sorry, data for this season is not available</p>
      <pre>
        (シ. .)シ
      </pre>
    </>
  } else {
    if (data.length > 0) output =
      <>
        <p>No anime match these filters</p>
        <pre>(・_・;)</pre>
      </>
    else {
      output = <>
        <p>Fetching Data</p>
        <pre>(≧◡≦)</pre>
      </>
      sortedData = getData(year, season)
    }
  }

  return (
    <div className='container'>
      <SeasonLink season={season} year={year} direction='prev'/>
      <SeasonLink season={season} year={year} direction='next'/>
      <Stats data={data} meta={meta}/>
      <div className='trend-container'>
        {output}
      </div>
    </div>
  )
}

Container.propTypes = {
  match: PropTypes.object
}

function NoMatch () {
  return <big className='container'>404</big>
}

export default class App extends React.Component {
  render () {
    thisApp = this

    return (
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Header/>
        <Bar/>
        <Router>
          <Switch>
            {/* Redirect homepage to current season */}
            <Route exact path='/' render={() => (
              <Redirect to={`/${y()}/${s()}`}/>
            )}/>
            {/* Redirect Fall -> Autumn */}
            <Route path='/:year/fall' render={() => (
              <Redirect to={`/${y()}/${s()}`}/>
            )}/>
            <Route path='/:year/:season' component={Container}/>
            <Route component={NoMatch}/>
          </Switch>
        </Router>
      </IconContext.Provider>
    )
  }
}
