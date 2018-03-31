import React from 'react'
import PropTypes from 'prop-types'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom'
import { decode } from 'msgpack-lite/lib/decode'
import { season as s, year as y, prevSeason, nextSeason, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import { Stats } from './components/Stats'
import '../styles/index.scss'

let thisApp = {}
let data = []
let meta = {}
let updated = ''
let collectionStartDate = Number.MAX_SAFE_INTEGER
let error = false

function reset () {
  data = []
  meta = {}
  error = false
  collectionStartDate = Number.MAX_SAFE_INTEGER
  thisApp.forceUpdate()
}

function sortData (by, update = true) {
  data = sort(data, by)
  if (update) thisApp.forceUpdate()
}

function getData (year = y(), season = s()) {
  fetch(`/msgpack/${year}-${season}.json`, {
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
        data[show].d[date].d = data[show].d[date].d * 3600000
        // Get the oldest date value from data collection
        if (data[show].d[date].d < collectionStartDate) {
          collectionStartDate = data[show].d[date].d
        }
      }
    }
  })
  .then(() => {
    sortData('m', false)
    thisApp.forceUpdate()
  })
  .catch(e => {
    error = e.message
    data = []
    thisApp.forceUpdate()
  })
}

function Bar () {
  return (
    <div className='bar'>
      <div>
        <div className='bar-sorts'>
          <span>Sort By</span>
          <button onClick={() => sortData('m')}>Score</button>
          <button onClick={() => sortData('u')}>Users</button>
          <button onClick={() => sortData('r')}>Percent Rated</button>
          <button onClick={() => sortData('f')}>Favorites</button>
        </div>
        <span className='info'>All airing anime this season, updated {updated ? distanceInWordsToNow(updated, { addSuffix: true }) : 'daily'}</span>
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

  if (Object.keys(data).length > 0 && !error) {
    output = data.map((entry, index) => {
      return <TrendContainer
        key={index}
        id={entry.i}
        title={entry.t}
        data={entry.d}
        start={collectionStartDate}
        leftover={entry.n ? !entry.n : true}
      />
    })
  } else if (error) {
    console.log(error)
    output = <p>Sorry, data for this season is not available</p>
  } else {
    data = getData(year, season)
    output = <p>Getting data...</p>
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
      <div>
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
      </div>
    )
  }
}
