import React from 'react'
import PropTypes from 'prop-types'
import { MdGroup, MdFavorite, MdStar, MdThumbsUpDown } from 'react-icons/md'

export class TrendTooltip extends React.Component {
  render () {
    const { active } = this.props

    if (active) {
      let { payload, label } = this.props
      const date = new Date(label)
      label = date.toLocaleDateString(navigator.langauge, {
        weekDay: 'long',
        day: '2-digit',
        year: 'numeric',
        month: 'long'
      })

      const [favourites, usersRated, users, mean] = payload

      return (
        <div>
          {label}
          <div className='changes'>
            <span>
              <MdStar style={{color: '#332532'}}/> {/* Mean */}
              <span> {mean.value.toFixed(2)}</span>
            </span>
            <span>
              <MdGroup style={{color: '#8686CC'}}/> {/* Users */}
              <span> {users.value}</span>
            </span>
            <span>
              <MdThumbsUpDown style={{color: '#86CC86'}}/> {/* Users Rated */}
              <span> {usersRated.value}</span>
            </span>
            <span>
              <MdFavorite style={{color: '#CC8686'}}/> {/* Favourites */}
              <span> {favourites.value}</span>
            </span>
          </div>
        </div>
      )
    }

    return null
  }
}

TrendTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.number
}
