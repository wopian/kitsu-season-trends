import React from 'react'
import PropTypes from 'prop-types'

export function Overlay (props) {
  return (
    <div className='overlay'>
      <div>
        Score
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

Overlay.propTypes = {
  mean: PropTypes.number,
  users: PropTypes.number,
  ratings: PropTypes.number,
  favorites: PropTypes.number
}
