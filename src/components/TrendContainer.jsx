import React from 'react'
import Trend from 'react-trend'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import MdGroup from 'react-icons/lib/md/group'
import MdFavorite from 'react-icons/lib/md/favorite'
import MdStar from 'react-icons/lib/md/star'
import MdThumbsUpDown from 'react-icons/lib/md/thumbs-up-down'
import { Overlay } from './Overlay'

function percentRated (usersRated, users) {
  return (usersRated.slice(-1)[0] - usersRated.slice(-2)[0]) / users.slice(-1)[0] * 100 || 0
}

function changePercentRated (usersRated, users) {
  return Number.isFinite(percentRated(usersRated, users)) ? percentRated(usersRated, users).toFixed(2) : 0
}

function changeArray (input) {
  return input.slice(-1)[0] - input.slice(-2)[0]
}

function posOrNeg (number) {
  if (number > 0) return `+${number}`
  else if (number < 0) return number
  else return `±${number}`
}

export function TrendContainer (props) {
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
          </div>
        </div>
      </a>
      <Trend
        className='trend-graph'
        smooth
        data={props.favorites.length > 1 ? props.favorites : props.favorites.concat(props.favorites)}
        gradient={['#ffb9b9']}
        radius={2}
        strokeWidth={4.7}
        strokeLinecap={'round'}
      />
      <Trend
        className='trend-graph'
        smooth
        data={props.usersRated.length > 1 ? props.usersRated : props.usersRated.concat(props.usersRated)}
        gradient={['#b9ffb9']}
        radius={2}
        strokeWidth={3.8}
        strokeLinecap={'round'}
      />
      <Trend
        className='trend-graph'
        smooth
        data={props.users.length > 1 ? props.users : props.users.concat(props.users)}
        gradient={['#b9b9ff']}
        radius={2}
        strokeWidth={2.9}
        strokeLinecap={'round'}
      />
      <Trend
        className='trend-graph'
        smooth
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

TrendContainer.propTypes = {
  title: PropTypes.string,
  slug: PropTypes.string,
  poster: PropTypes.string,
  mean: PropTypes.array,
  users: PropTypes.array,
  favorites: PropTypes.array,
  usersRated: PropTypes.array,
}
