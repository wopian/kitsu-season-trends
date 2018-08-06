import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { IconContext } from 'react-icons'
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom'
import { decode } from 'msgpack-lite/lib/decode'
import { season as s, year as y, prevSeason, nextSeason, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import { Stats } from './components/Stats'
import '../styles/index.scss'

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
  old: true
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
        if (!data[show].d[date].m) data[show].d[date].m = 0
        if (!data[show].d[date].r) data[show].d[date].r = 0
        if (!data[show].d[date].u) data[show].d[date].u = 0
        if (!data[show].d[date].f) data[show].d[date].f = 0

        // Convert hours since epoch into milliseconds
        data[show].d[date].d = data[show].d[date].d * 36e5
        // Get the oldest date value from data collection
        if (data[show].d[date].d < collectionStartDate) {
          collectionStartDate = data[show].d[date].d
        }
      }
    }
  })
  .then(() => {
    sortData({ by: 'm', update: false })
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
  by: PropTypes.oneOf([ 'm', 'u', 'r', 'f' ]),
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
          <SortButton by='m' label='Score'/>
          <SortButton by='u' label='Users'/>
          <SortButton by='r' label='Users Rated'/>
          <SortButton by='f' label='Favourites'/>
        </div>
        <div className='bar-filters'>
          <span>Filter</span>
          <FilterButton filter='tv' label='TV'/>
          <FilterButton filter='ona' label='ONA'/>
          <FilterButton filter='new' label='New'/>
          <FilterButton filter='old' label='Leftovers'/>
        </div>
        <span className='info'>Airing anime this season, updated {updated ? distanceInWordsToNow(updated, { addSuffix: true }) : 'daily'}</span>
      </div>
    </div>
  )
}

function Container ({ match }) {
  const { year, season } = match.params
  let output = {}

  const next = nextSeason({
    s: season || s(),
    y: ~~(year || y())
  })

  const prev = prevSeason({
    s: season || s(),
    y: ~~(year || y())
  })

  if (Object.keys(sortedData).length > 0 && !error) {
    output = sortedData.map((entry, index) => {
      return <TrendContainer
        key={index}
        rank={++index}
        id={entry.i}
        title={entry.t}
        data={entry.d}
        start={collectionStartDate}
        newAnime={typeof entry.n === 'number' ? entry.n : 1}
      />
    })
  } else if (error) {
    console.log(error)
    output = <p>Sorry, data for this season is not available</p>
  } else {
    sortedData = getData(year, season)
    if (data.length > 0) output = <p>No anime match these filters</p>
    else output = <p>Getting data...</p>
  }

  return (
    <div className='container'>
      <Link className='link prev' to={`/${prev.y}/${prev.s}`} onClick={reset}>Last season</Link>
      <Link className='link next' to={`/${next.y}/${next.s}`} onClick={reset}>Next season</Link>
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
