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
      <h2>2017</h2>
      <h3>Spring</h3>
    </header>
  )
}

function TrendContainer (props) {
  dataSorted.map((entry, index) => {
    return (
      <div
        key={index}
        className='trend'
      >
        <a href={"//kitsu.io/anime/" + entry.slug}>
          <img src={entry.poster}/>
          <span>{entry.title}</span>
        </a>
        <Trend
          smooth
          autoDraw
          autoDrawDuration={3000}
          autoDrawEasing="ease-out"
          //data={entry[1].mean}
          data={[1,2]}
          gradient={['#222']}
          radius={2}
          strokeWidth={2}
          strokeLinecap={'round'}
        />
        <div className='overlay'>
          <div>
            Users
            <span>{entry.users.slice(-1)[0]}</span>
          </div>
          <div>
            Mean
            <span>{entry.mean.slice(-1)[0]}</span>
          </div>
          <div>
            Favorites
            <span>{entry.favorites.slice(-1)[0]}</span>
          </div>
        </div>
      </div>
    )
  })
}

export default class App extends React.Component {
  render() {
    return (/*
      <div className='container'>
        {Object.entries(data).map((entry, index) => {
          */
      <div className='container'>
        {dataSorted.map((entry, index) => {
          return <div
            key={index}
            className='trend'
          >
            <a href={"//kitsu.io/anime/" + entry.slug}>
              <img src={entry.poster}/>
              <span>{entry.title}</span>
            </a>
            <Trend
              smooth
              autoDraw
              autoDrawDuration={3000}
              autoDrawEasing="ease-out"
              //data={entry[1].mean}
              data={[1,2]}
              gradient={['#222']}
              radius={2}
              strokeWidth={2}
              strokeLinecap={'round'}
            />
            <div className='overlay'>
              <div>
                Users
                <span>{entry.users.slice(-1)[0]}</span>
              </div>
              <div>
                Mean
                <span>{entry.mean.slice(-1)[0]}</span>
              </div>
              <div>
                Favorites
                <span>{entry.favorites.slice(-1)[0]}</span>
              </div>
            </div>
          </div>
        })}
      </div>
    )
  }
}
