import React from 'react'
import PropTypes from 'prop-types'
import ago from 's-ago'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { season as s, year as y, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import '../styles/index.scss'

let thisApp = {}
let data = {}
let updated = ''
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
    sortData('mean', false)
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
          <button onClick={() => sortData('mean')}>Score</button>
          <button onClick={() => sortData('users')}>Users</button>
          <button onClick={() => sortData('usersRated')}>Percent Rated</button>
          <button onClick={() => sortData('favorites')}>Favorites</button>
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
        slug={entry.slug}
        poster={entry.poster}
        title={entry.title}
        mean={entry.mean}
        users={entry.users}
        usersRated={entry.usersRated}
        favorites={entry.favorites}
      />
    })
  } else if (error) {
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
