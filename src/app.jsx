import React from 'react'
import Trend from 'react-trend'
import classnames from 'classnames'
import { MdGroup, MdFavorite, MdStar, MdThumbsUpDown } from 'react-icons/lib/md'
import { season, year } from './season'
import '../styles/index.scss'

const { data } = require(`../data/${year()}-${season()}.json`)

let dataSorted = sort('mean')
let thisApp

function sort (by) {
  return Object.values(data).sort((A,B) => {
    let a, b
    if (by === 'rated') {
      a = A['usersRated'].slice(-1)[0] / A['users'].slice(-1)[0]
      b = B['usersRated'].slice(-1)[0] / B['users'].slice(-1)[0]
    } else {
      a = A[by] instanceof Array ? A[by].slice(-1)[0] : A[by]
      b = B[by] instanceof Array ? B[by].slice(-1)[0] : B[by]
    }
    return a > b ? -1 : a < b ? 1 : 0
  })
}

// props.ratings / props.users * 100

function sortData (by) {
  dataSorted = sort(by)
  thisApp.forceUpdate()
}

/*
class Button extends React.Component {
  constructor (props) {
    super(props)
    this.state = {active: false}
  }

  click () {
    this.setState({active: !this.state.active})
  }

  render () {
    let classes = classnames({active: this.state.active})
    return <button className={classes} onClick={this.click.bind(this)}>Click Me</button>
  }
}
*/

function Bar (props) {
  return (
    <div className='bar'>
      <div>
        Sort By
        <button onClick={() => sortData('mean')}>Rating</button>
        <button onClick={() => sortData('users')}>Popularity</button>
        <button onClick={() => sortData('favorites')}>Favorites</button>
        <button onClick={() => sortData('rated')}>Percent Rated</button>
        <span className='info'>All airing shows this season, updated daily</span>
      </div>
    </div>
  )
}

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
        Mean
        <span>{props.mean}</span>
      </div>
      <div>
        Users
        <span>{props.users}</span>
      </div>
      <div>
        Rated
        <span>{(props.ratings / props.users * 100).toFixed(0)}%</span>
      </div>
      <div>
        Favorites
        <span>{props.favorites}</span>
      </div>
    </div>
  )
}

function percentRated (usersRated, users) {
  return (usersRated.slice(-1)[0] - usersRated.slice(-2)[0]) / (users.slice(-1)[0] - users.slice(-2)[0]) * 100 || 0
}

function changePercentRated (usersRated, users) {
  return Number.isFinite(percentRated(usersRated, users)) ? percentRated(usersRated, users).toFixed(0) : 0
}

function changeArray (input) {
  return input.slice(-1)[0] - input.slice(-2)[0]
}

function posOrNeg (number) {
  if (number > 0) return `+${number}`
  else if (number < 0) return number
  else return `±${number}`
}

function TrendContainer (props) {
  let rating
  return (
    <div className='trend'>
      <a href={"//kitsu.io/anime/" + props.slug}>
        <img src={props.poster}/>
        <div>
          <div className='title'>{props.title}</div>
          <div className='changes'>
            <span>
              <MdStar/>
              <span className={classnames({
                pos: changeArray(props.mean) > 0,
                neg: changeArray(props.mean) < 0
              })}>
                {posOrNeg(changeArray(props.mean).toFixed(2))}
              </span>
            </span>
            <span>
              <MdGroup/>
              <span className={classnames({
                pos: changeArray(props.users) > 0,
                neg: changeArray(props.users) < 0
              })}>
                {posOrNeg(changeArray(props.users))}
              </span>
            </span>
            <span>
              <MdThumbsUpDown/>
              <span className={classnames({
                pos: changePercentRated(props.usersRated, props.users) > 0,
                neg: changePercentRated(props.usersRated, props.users) < 0
              })}>
                {posOrNeg(changePercentRated(props.usersRated, props.users))}%
              </span>
            </span>
            <span>
              <MdFavorite/>
              <span className={classnames({
                pos: changeArray(props.favorites) > 0,
                neg: changeArray(props.favorites) < 0
              })}>
                {posOrNeg(changeArray(props.favorites))}
              </span>
            </span>

            {/*
            <span>+54</span>
            <span>+1%</span>
            <span>-2</span>
            */}
          </div>
        </div>
      </a>
      <Trend
        className='trend-graph'
        smooth
        autoDraw
        autoDrawDuration={1500}
        autoDrawEasing="ease-in-out"
        data={props.mean.length > 1 ? props.mean : props.mean.concat(props.mean)}
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
