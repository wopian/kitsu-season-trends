import React from 'react'
import ago from 's-ago'
import { season, year, sort } from './util'
import { Header } from './components/Header'
import { TrendContainer } from './components/TrendContainer'
import '../styles/index.scss'

const { data } = require(`../data/${year()}-${season()}.json`)

let dataSorted = sort(data, 'mean')
let thisApp

function sortData (by) {
  dataSorted = sort(by)
  thisApp.forceUpdate()
}

function Bar () {
  return (
    <div className='bar'>
      <div>
        <div className='bar-sorts'>
          <span>Sort By</span>
          <button onClick={() => sortData('mean')}>Rating</button>
          <button onClick={() => sortData('users')}>Users</button>
          <button onClick={() => sortData('usersRated')}>Percent Rated</button>
          <button onClick={() => sortData('favorites')}>Favorites</button>
        </div>
        <span className='info'>All airing shows this season, updated daily {/*({ago(dataSorted[0].updated)}*/}</span>
      </div>
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
        <div className='container'>
          {dataSorted.map((entry, index) => {
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
          })}
        </div>
      </div>
    )
  }
}
