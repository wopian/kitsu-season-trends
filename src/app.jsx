import React from 'react'
import Trend from 'react-trend'
import { season, year } from './season'
import '../styles/index.scss'

const { data } = require(`../data/${year()}-${season()}.json`)

const dataSorted = Object.values(data).sort((a, b) => {
  const A = a.mean.slice(-1)[0]
  const B = b.mean.slice(-1)[0]
  return A > B ? -1 : A < B ? 1 : 0
})

function Header (props) {
  return (
    <header>
      <h1>Kitsu</h1>
      <h2>
        {season().toUpperCase()}
        <strong>{year()}</strong>
      </h2>
    </header>
  )
}

function Overlay (props) {
  return (
    <div className='overlay'>
      <div>
        Users
        <span>{props.users}</span>
      </div>
      <div>
        Rated
        <span>{(props.ratings / props.users * 100).toFixed(0)}%</span>
      </div>
      <div>
        Mean
        <span>{props.mean}</span>
      </div>
      <div>
        Favorites
        <span>{props.favorites}</span>
      </div>
    </div>
  )
}

function TrendContainer (props) {
  return (
    <div className='trend'>
      <a href={"//kitsu.io/anime/" + props.slug}>
        <img src={props.poster}/>
        <span>{props.title}</span>
      </a>
      <Trend
        smooth
        autoDraw
        autoDrawDuration={1500}
        autoDrawEasing="ease-in-out"
        //data={props.mean}
        data={[1,2]}
        gradient={['#332532']}
        radius={2}
        strokeWidth={2}
        strokeLinecap={'round'}
      />
      <Overlay
        mean={props.mean.slice(-1)[0]}
        users={props.users.slice(-1)[0]}
        favorites={props.favorites.slice(-1)[0]}
        ratings={props.usersRated.slice(-1)[0]}
      />
    </div>
  )
}

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Header/>
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
