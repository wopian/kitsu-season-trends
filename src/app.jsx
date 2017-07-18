import React from 'react'
import ago from 's-ago'
import { season, year, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import '../styles/index.scss'

// const { data, updated } = require(`../data/${year()}-${season()}.json`)

let thisApp = {}
let data = {}
let updated = ''

fetch(`/data/${year()}-${season()}.json`, {
  method: 'get'
})
.then(res => res.json())
.then(res => {
  ({ data, updated } = res)
  thisApp.forceUpdate()
})

function sortData (by, update = true) {
  data = sort(data, by)
  if (update) thisApp.forceUpdate()
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
        <span className='info'>All airing shows this season, updated daily{updated ? ` (${ago(new Date(updated))})` : ''}</span>
      </div>
    </div>
  )
}

function Container () {
  let test = {}
  if (Object.keys(data).length > 0) {
    sortData('mean', false)

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
  } else test = <p>Getting data...</p>

  return (
    <div className='container'>
      {test}
    </div>
  )
}

export default class App extends React.Component {
  render() {
    thisApp = this
    return (
      <div>
        <Header/>
        <Bar/>
        <Container/>
      </div>
    )
  }
}
