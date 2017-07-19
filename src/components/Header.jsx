import React from 'react'
import PropTypes from 'prop-types'
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

HeaderContent.propTypes = {
  match: PropTypes.object
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
