import React from 'react'
import PropTypes from 'prop-types'
import ago from 's-ago'
import { decode } from 'base-65503'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { season as s, year as y, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import '../styles/index.scss'

let thisApp = {}
let data = {}
let updated = ''
let collectionStartDate = Number.MAX_SAFE_INTEGER
let error = false

function sortData (by, update = true) {
  data = sort(data, by)
  if (update) thisApp.forceUpdate()
}

function getData (year = y(), season = s()) {
  fetch(`/data/${year}-${season}.json`, {
    method: 'get'
  })
  .then(res => {
    if(res.ok) return res.json()
    else throw new Error(404)
  })
  .then(res => {
    ({ data, updated } = res)

    for (let show in data) {
      for (let date in data[show].d) {
        data[show].d[date].d = decode(data[show].d[date].d)
        data[show].d[date].r = decode(data[show].d[date].r)
        data[show].d[date].u = decode(data[show].d[date].u)
        data[show].d[date].f = decode(data[show].d[date].f)

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
    data = {}
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
        <span className='info'>All airing shows this season, updated {updated ? ago(new Date(updated)) : ''}</span>
      </div>
    </div>
  )
}

function Container ({ match }) {
  const { year, season } = match.params
  let test = {}

  if (Object.keys(data).length > 0 && !error) {
    test = data.map((entry, index) => {
      return <TrendContainer
        key={index}
        id={entry.i}
        slug={entry.s}
        poster={entry.p}
        title={entry.t}
        data={entry.d}
        start={collectionStartDate}
      />
    })
  } else if (error) {
    console.log(error)
    test = <p>Sorry, data for this season is not available</p>
  } else {
    data = getData(year, season)
    test = <p>Getting data...</p>
  }

  return (
    <div className='container'>
      {test}
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
  render() {
    thisApp = this
    return (
      <div>
        <Header/>
        <Bar/>
        <Router>
          <Switch>
            <Route exact path='/' render={() => (
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
