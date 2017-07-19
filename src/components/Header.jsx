import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { season, year } from '../util'

function HeaderContent ({ match }) {
  return (
    <header>
      <h1>Kitsu</h1>
      <h2>
        {(match.params.season || season()).toUpperCase()}
        <strong>{match.params.year || year()}</strong>
      </h2>
    </header>
  )
}

export function Header () {
  return (
    <Router>
      <Switch>
        <Route path='/:year/:season' component={HeaderContent}/>
        <Route component={HeaderContent}/>
      </Switch>
    </Router>
  )
}
